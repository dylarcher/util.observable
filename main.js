/**
 * @class ObservableService
 * @description A service for observing changes in data states using the Proxy API to auto-detect updates & notify subscribers registered to the state context. The state object is frozen, enforcing immutablility constraints when passed to the subscribers. This prevents any unintentional mutations and provides a consistent state management workflow.
 * 
 * @typedef {object} ObservableTypes
 * @property {object} state - The current state of the service, which is a Proxy object that allows for property amendments and pruning.
 * @property {function} amendState - Method to amend a property in the state. It checks if the new value is different from the current value before updating it, and queues a notification if the value changes.
 * @property {function} pruneState - Method to prune a property from the state. It checks if the property exists before attempting to remove it, and queues a notification if the property is pruned.
 * @property {function} subscribe - Method to add a subscriber function that will be notified of state changes.
 * @property {function} unsubscribe - Method to remove a specific subscriber function from the notification list.
 * @property {function} unsubscribeAll - Method to remove all subscriber functions from the notification list.
 * @example
 * const service = new ObservableService({ key: 'value' });
 * service.subscribe((fresh, stale) => {
 *   console.log('State changed from', stale, 'to', fresh);
 * });
 * service.state.key = 'newValue'; // This will trigger the subscriber
 * service.state.key = 'newValue'; // No notification, value is the same
 * service.state.key = 'newValue'; // No notification, value is the same
 */
export /** @type {ObservableTypes} */ class ObservableService {
  /** @type {Set<function>} */ #subscribers = new Set();
  /** @type {boolean} */ #queuedUpdateNotice = false;
  /** @type {object} */ #preBatchStaleState = {};
  /** @type {Record<string, any>} */ #state = {};

  constructor(/** @type {object} */ source) {
    this.#subscribers = new Set();
    /**
     * Agent object that handles state modifications through proxy traps.
     * Provides methods to amend and prune state properties while maintaining
     * a queue of state changes.
     * @typedef {object} AgentInterface
     * @property {function(object, string|symbol, any, any): boolean} set - Modifies a state property with the given key and value. Returns true if the amendment was successful.
     * @property {function(object, string|symbol): boolean} deleteProperty - Removes a state property with the given key. Returns true if the pruning was successful.
     */

    /** @type {AgentInterface & ProxyHandler<object>} */
    const agent = {
      set: (/** @type {object} */ target, /** @type {string|symbol} */ key, /** @type {any} */ value, /** @type {any} */ receiver) => {
        const result = this.amendState(key, value);
        result && this.addToQueue(this.#state);
        return result;
      },
      deleteProperty: (/** @type {object} */ target, /** @type {string|symbol} */ key) => {
        const result = this.pruneState(key);
        result && this.addToQueue(this.#state);
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

  amendState(/** @type {string|symbol} */ key, /** @type {any} */ change) {
    if (Object.is(Reflect.get(this.#state, key), change)) return true;
    if (!this.#queuedUpdateNotice) {
      this.#preBatchStaleState = { ...this.#state };
    }
    return Reflect.set(this.#state, key, change);
  }

  pruneState(/** @type {string|symbol} */ key) {
    if (!Object.hasOwn(this.#state, key)) return true;
    if (!this.#queuedUpdateNotice) {
      this.#preBatchStaleState = { ...this.#state };
    }
    return Reflect.deleteProperty(this.#state, key);
  }

  addToQueue(/** @type {object} */ update) {
    if (this.#queuedUpdateNotice) return;
    this.#queuedUpdateNotice = true;
    Promise.resolve().then(() => {
      this.emitQueued(update, this.#preBatchStaleState);
      this.#queuedUpdateNotice = false;
      this.#preBatchStaleState = {};
    });
  }

  emitQueued(/** @type {object} */ fresh, /** @type {object} */ stale) {
    const frozenFresh = Object.freeze({ ...fresh });
    const frozenStale = Object.freeze({ ...stale });
    for (const subscriber of this.#subscribers) {
      subscriber(frozenFresh, frozenStale);
    }
  }
}

export default { ObservableService };