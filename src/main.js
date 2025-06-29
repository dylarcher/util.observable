/**
 * @class ObservableService
 * @description Observable state management using Proxy API.
 * @typedef {object} ObservableTypes Auto-detects changes and notifies subscribers w/ frozen immutable state.
 * @property {object} state - Proxy object for state manipulation
 * @property {function} amendState - Update a state property
 * @property {function} pruneState - Remove a state property
 * @property {function} subscribe - Add change subscriber
 * @property {function} unsubscribe - Remove specific subscriber
 * @property {function} unsubscribeAll - Remove all subscribers
 * @example
 * const service = new ObservableService({ key: 'value' });
 * service.subscribe((fresh, stale) => console.log('Changed:', fresh));
 * service.state.key = 'newValue'; // Triggers notification
 */
export /** @type {ObservableTypes} */ class ObservableService {
  /** @type {Set<function>} */ #subscribers = new Set();
  /** @type {boolean} */ #queuedUpdateNotice = false;
  /** @type {object} */ #preBatchStaleState = {};
  /** @type {Record<string, any>} */ #state = {};
  /** @type {Record<string, any>} */ #target = {};

  constructor(/** @type {object} */ source = {}) {
    this.#subscribers = new Set();
    this.#target = source;

    /** @type {ProxyHandler<object>} */
    const agent = {
      set: (target, key, value, receiver) => {
        const hadChange = !Object.is(Reflect.get(this.#target, key), value);
        const result = this.amendState(key, value);
        hadChange && result && this.addToQueue(this.#target);
        return result;
      },
      deleteProperty: (target, key) => {
        const hadChange = Object.hasOwn(this.#target, key);
        const result = this.pruneState(key);
        hadChange && result && this.addToQueue(this.#target);
        return result;
      },
    };
    this.#state = new Proxy(this.#target, agent);
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
    if (Object.is(Reflect.get(this.#target, key), change)) return true;
    if (!this.#queuedUpdateNotice) {
      this.#preBatchStaleState = { ...this.#target };
    }
    return Reflect.set(this.#target, key, change);
  }

  pruneState(/** @type {string|symbol} */ key) {
    if (!Object.hasOwn(this.#target, key)) return true;
    if (!this.#queuedUpdateNotice) {
      this.#preBatchStaleState = { ...this.#target };
    }
    return Reflect.deleteProperty(this.#target, key);
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
