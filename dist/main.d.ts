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
export class ObservableService {
    constructor(source?: object);
    get state(): Record<string, any>;
    subscribe(subscriber: Function): void;
    unsubscribe(subscriber: Function): void;
    unsubscribeAll(): void;
    amendState(key: string | symbol, change: any): boolean;
    pruneState(key: string | symbol): boolean;
    addToQueue(update: object): void;
    emitQueued(fresh: object, stale: object): void;
    #private;
}
declare namespace _default {
    export { ObservableService };
}
export default _default;
/**
 * Auto-detects changes and notifies subscribers w/ frozen immutable state.
 */
export type ObservableTypes = {
    /**
     * - Proxy object for state manipulation
     */
    state: object;
    /**
     * - Update a state property
     */
    amendState: Function;
    /**
     * - Remove a state property
     */
    pruneState: Function;
    /**
     * - Add change subscriber
     */
    subscribe: Function;
    /**
     * - Remove specific subscriber
     */
    unsubscribe: Function;
    /**
     * - Remove all subscribers
     */
    unsubscribeAll: Function;
};
