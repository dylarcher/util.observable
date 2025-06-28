/**
 * @class ObservableService
 * @description A service for observing changes in data states using the Proxy API to auto-detect updates & notify subscribers registered to the state context. The state object is frozen, enforcing immutablility constraints when passed to the subscribers. This prevents any unintentional mutations and provides a consistent state management workflow.
 * 
 * @typedef {object} ObservableService
 * @property {object} state - The current state of the service, which is a Proxy object that allows for property amendments and pruning.
 * @property {function} amendProperty - Method to amend a property in the state. It checks if the new value is different from the current value before updating it, and queues a notification if the value changes.
 * @property {function} pruneProperty - Method to prune a property from the state. It checks if the property exists before attempting to remove it, and queues a notification if the property is pruned.
 * @property {function} subscribe - Method to add a subscriber function that will be notified of state changes.
 * @property {function} unsubscribe - Method to remove a specific subscriber function from the notification list.
 * @property {function} unsubscribeAll - Method to remove all subscriber functions from the notification list.
 * @property {function} #queueNotice - Internal method to queue a notification for subscribers when the state changes. It batches updates to avoid multiple notifications in a single tick.
 * @property {function} #notify - Internal method to notify all subscribers of the state change. It freezes the fresh and stale states before notifying to ensure immutability.
 * @example
 * const service = new ObservableService({ key: 'value' });
 * service.subscribe((fresh, stale) => {
 *   console.log('State changed from', stale, 'to', fresh);
 * });
 * service.state.key = 'newValue'; // This will trigger the subscriber
 * service.state.key = 'newValue'; // No notification, value is the same
 * service.state.key = 'newValue'; // No notification, value is the same
 */
export class ObservableService {
  /** @type {Set<function>} */ #subscribers = new Set();
  /** @type {boolean} */ #queuedUpdateNotice = false;
  /** @type {object} */ #preBatchStaleState = {};
  /** @type {object} */ #state = {};

  constructor(/** @type {object} */ source = {}) {
    this.#subscribers = new Set();
    const agent = {
      set: (state, key, value) => {
        // Check if value is actually changing
        if (Object.is(state[key], value)) {
          return true; // No change, no notification
        }

        if (!this.#queuedUpdateNotice) {
          this.#preBatchStaleState = { ...state };
        }

        const result = Reflect.set(state, key, value);
        if (result) {
          this.#addToQueue(state);
        }
        return result;
      },
      deleteProperty: (state, key) => {
        // Check if property exists
        if (!Object.hasOwn(state, key)) {
          return true; // Property doesn't exist, no notification
        }

        if (!this.#queuedUpdateNotice) {
          this.#preBatchStaleState = { ...state };
        }

        const result = Reflect.deleteProperty(state, key);
        if (result) {
          this.#addToQueue(state);
        }
        return result;
      },
    };
    this.#state = new Proxy(source, agent);
  }

  get state() /** @type {object} */ {
    return this.#state;
  }

  subscribe(/** @type {function} */ subscriber) {
    this.#subscribers.add(subscriber);
  }

  unsubscribe(/** @type {function} */ subscriber) {
    this.#subscribers.delete(subscriber);
  }

  unsubscribeAll() {
    this.#subscribers.clear();
  }

  #addToQueue(/** @type {object} */ update) {
    if (this.#queuedUpdateNotice) return;
    this.#queuedUpdateNotice = true;
    Promise.resolve().then(() => {
      this.#emitQueued(update, this.#preBatchStaleState);
      this.#queuedUpdateNotice = false;
      this.#preBatchStaleState = {};
    });
  }

  #emitQueued(/** @type {object} */ fresh, /** @type {object} */ stale) {
    const frozenFresh = Object.freeze({ ...fresh });
    const frozenStale = Object.freeze({ ...stale });
    for (const subscriber of this.#subscribers) {
      subscriber(frozenFresh, frozenStale);
    }
  }
}

export default { ObservableService };