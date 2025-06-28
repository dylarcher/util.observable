import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ObservableService } from './main.js';

describe('ObservableService', () => {
  test('should set initial state', () => {
    const initialState = { a: 1 };
    const service = new ObservableService(initialState);
    assert.deepStrictEqual(service.state, initialState);
  });

  test('should notify subscriber on state change', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    service.state.a = 2;

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(subscriber.mock.calls.length, 1);
    const [newState, oldState] = subscriber.mock.calls[0].arguments;
    assert.deepStrictEqual(newState, { a: 2 });
    assert.deepStrictEqual(oldState, { a: 1 });
  });

  test('should not notify subscriber if value is the same', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    service.state.a = 1;

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.strictEqual(subscriber.mock.calls.length, 0);
  });

  test('should batch multiple updates into one notification', async () => {
    const service = new ObservableService({ a: 1, b: 2 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);

    service.state.a = 3;
    service.state.b = 4;

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(subscriber.mock.calls.length, 1);
    const [newState, oldState] = subscriber.mock.calls[0].arguments;
    assert.deepStrictEqual(newState, { a: 3, b: 4 });
    assert.deepStrictEqual(oldState, { a: 1, b: 2 });
  });

  test('should handle delete property', async () => {
    const service = new ObservableService({ a: 1, b: 2 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    delete service.state.a;

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(subscriber.mock.calls.length, 1);
    const [newState, oldState] = subscriber.mock.calls[0].arguments;
    assert.deepStrictEqual(newState, { b: 2 });
    assert.deepStrictEqual(oldState, { a: 1, b: 2 });
  });

  test('should not notify on deleting a non-existent property', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    delete service.state.b;

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.strictEqual(subscriber.mock.calls.length, 0);
  });

  test('should unsubscribe a subscriber', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    service.unsubscribe(subscriber);
    service.state.a = 2;

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.strictEqual(subscriber.mock.calls.length, 0);
  });

  test('should unsubscribe all subscribers', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber1 = mock.fn();
    const subscriber2 = mock.fn();
    service.subscribe(subscriber1);
    service.subscribe(subscriber2);
    service.unsubscribeAll();
    service.state.a = 2;

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.strictEqual(subscriber1.mock.calls.length, 0);
    assert.strictEqual(subscriber2.mock.calls.length, 0);
  });

  test('should provide a frozen state to subscribers to prevent mutation', async () => {
    const service = new ObservableService({ a: 1 });
    const subscriber = mock.fn();
    service.subscribe(subscriber);
    service.state.a = 2;

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(subscriber.mock.calls.length, 1);
    const [newState] = subscriber.mock.calls[0].arguments;
    assert.ok(Object.isFrozen(newState));
    assert.throws(() => {
      newState.a = 3;
    }, TypeError);
  });
});
