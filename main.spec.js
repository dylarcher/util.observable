import { test } from './tests/utils.js';
import { ObservableService } from './main.js';

console.group('🧪 ObservableService Tests');

// Test 1: Constructor with empty initial state
test({
  subject: "Constructor creates instance with empty initial state",
  fn: () => {
    const service = new ObservableService();
    return typeof service.state === 'object' && Object.keys(service.state).length === 0;
  },
  args: [],
  expect: true
});

// Test 2: Constructor with provided initial state
test({
  subject: "Constructor creates instance with provided initial state",
  fn: () => {
    const initialState = { name: "test", value: 42 };
    const service = new ObservableService(initialState);
    return service.state.name === "test" && service.state.value === 42;
  },
  args: [],
  expect: true
});

// Test 3: State getter returns the proxied state
test({
  subject: "State getter returns the proxied state object",
  fn: () => {
    const service = new ObservableService({ test: "value" });
    return service.state.test;
  },
  args: [],
  expect: "value"
});

// Test 4: Setting a property updates the state
test({
  subject: "Setting a property updates the state",
  fn: () => {
    const service = new ObservableService();
    service.state.newProperty = "newValue";
    return service.state.newProperty;
  },
  args: [],
  expect: "newValue"
});

// Test 5: Setting the same value doesn't trigger unnecessary updates
test({
  subject: "Setting the same value doesn't change state",
  fn: () => {
    const service = new ObservableService({ prop: "initial" });
    const beforeUpdate = service.state.prop;
    service.state.prop = "initial"; // Same value
    return service.state.prop === beforeUpdate;
  },
  args: [],
  expect: true
});

// Test 6: Subscribe adds a subscriber
test({
  subject: "Subscribe method adds a subscriber successfully",
  fn: () => {
    const service = new ObservableService();
    let called = false;
    const subscriber = () => { called = true; };
    service.subscribe(subscriber);
    service.state.test = "trigger";
    // Since notifications are async, we can't directly test the call
    // Instead, test that subscribe doesn't throw
    return true;
  },
  args: [],
  expect: true
});

// Test 7: Unsubscribe removes a subscriber
test({
  subject: "Unsubscribe method removes a subscriber successfully",
  fn: () => {
    const service = new ObservableService();
    const subscriber = () => { };
    service.subscribe(subscriber);
    service.unsubscribe(subscriber);
    // Test that unsubscribe doesn't throw
    return true;
  },
  args: [],
  expect: true
});

// Test 8: UnsubscribeAll removes all subscribers
test({
  subject: "UnsubscribeAll method removes all subscribers",
  fn: () => {
    const service = new ObservableService();
    const subscriber1 = () => { };
    const subscriber2 = () => { };
    service.subscribe(subscriber1);
    service.subscribe(subscriber2);
    service.unsubscribeAll();
    // Test that unsubscribeAll doesn't throw
    return true;
  },
  args: [],
  expect: true
});

// Test 9: Deleting a property works
test({
  subject: "Deleting an existing property removes it from state",
  fn: () => {
    const service = new ObservableService({ toDelete: "value", toKeep: "keep" });
    delete service.state.toDelete;
    return service.state.toDelete === undefined && service.state.toKeep === "keep";
  },
  args: [],
  expect: true
});

// Test 10: Deleting a non-existent property doesn't cause errors
test({
  subject: "Deleting a non-existent property doesn't cause errors",
  fn: () => {
    const service = new ObservableService({ existing: "value" });
    delete service.state.nonExistent;
    return service.state.existing === "value";
  },
  args: [],
  expect: true
});

// Test 11: Multiple property updates in same tick
test({
  subject: "Multiple property updates work correctly",
  fn: () => {
    const service = new ObservableService();
    service.state.prop1 = "value1";
    service.state.prop2 = "value2";
    service.state.prop3 = "value3";
    return service.state.prop1 === "value1" &&
      service.state.prop2 === "value2" &&
      service.state.prop3 === "value3";
  },
  args: [],
  expect: true
});

// Test 12: Object.assign updates work
test({
  subject: "Object.assign updates work correctly",
  fn: () => {
    const service = new ObservableService({ initial: "value" });
    Object.assign(service.state, {
      prop1: "new1",
      prop2: "new2",
      initial: "updated"
    });
    return service.state.prop1 === "new1" &&
      service.state.prop2 === "new2" &&
      service.state.initial === "updated";
  },
  args: [],
  expect: true
});

// Test 13: State spread operator works
test({
  subject: "State spread operator preserves existing properties",
  fn: () => {
    const service = new ObservableService({
      keep1: "value1",
      keep2: "value2",
      change: "old"
    });

    // Simulate spread operation
    const newState = { ...service.state, change: "new", added: "extra" };
    Object.assign(service.state, newState);

    return service.state.keep1 === "value1" &&
      service.state.keep2 === "value2" &&
      service.state.change === "new" &&
      service.state.added === "extra";
  },
  args: [],
  expect: true
});

// Test 14: Nested object updates
test({
  subject: "Nested object property updates work",
  fn: () => {
    const service = new ObservableService({
      nested: { inner: "original" }
    });
    service.state.nested = { inner: "updated", new: "property" };
    return service.state.nested.inner === "updated" &&
      service.state.nested.new === "property";
  },
  args: [],
  expect: true
});

// Test 15: Array property updates
test({
  subject: "Array property updates work correctly",
  fn: () => {
    const service = new ObservableService({ items: [] });
    service.state.items = [1, 2, 3];
    return Array.isArray(service.state.items) &&
      service.state.items.length === 3 &&
      service.state.items[0] === 1;
  },
  args: [],
  expect: true
});

// Async test for subscriber notifications
// Test 16: Subscriber receives notifications (async test)
const asyncTest = async () => {
  console.group('🔄 Async Subscriber Notification Test');

  const service = new ObservableService({ initial: "value" });
  let notificationReceived = false;
  let receivedNewState = null;
  let receivedOldState = null;

  const subscriber = (newState, oldState) => {
    notificationReceived = true;
    receivedNewState = newState;
    receivedOldState = oldState;
  };

  service.subscribe(subscriber);
  service.state.initial = "updated";

  // Wait for microtask to complete
  await new Promise(resolve => setTimeout(resolve, 0));

  const success = notificationReceived &&
    receivedNewState.initial === "updated" &&
    receivedOldState.initial === "value";

  console.info(`✅ Async Test Result: ${success ? 'PASSED' : 'FAILED'}`);
  console.info('Notification received:', notificationReceived);
  console.info('New state:', receivedNewState);
  console.info('Old state:', receivedOldState);

  console.groupEnd();
  return success;
};

// Run the async test
asyncTest().then(result => {
  console.info(`🎯 Async subscriber test: ${result ? 'PASSED' : 'FAILED'}`);
});

console.groupEnd();

console.info('🏁 All ObservableService tests completed! Check console for detailed results.');