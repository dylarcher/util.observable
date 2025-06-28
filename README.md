# util.observable

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

A lightweight, dependency-free JavaScript utility for reactive state management using the Proxy API. Track changes to your application state automatically and get notified when updates occur, all with an intuitive API and built-in batching for optimal performance.

## Features

- 🚀 **Zero Dependencies** - Pure JavaScript implementation
- 📦 **Lightweight** - Minimal footprint with maximum functionality
- 🔄 **Reactive State Management** - Automatic change detection using Proxy API
- ⚡ **Batched Updates** - Multiple changes in the same tick are batched into a single notification
- 🧊 **Immutable Snapshots** - Subscribers receive frozen state objects to prevent accidental mutations
- 🎯 **Type-Safe** - Full JSDoc annotations for excellent IDE support
- 🧪 **100% Test Coverage** - Thoroughly tested with comprehensive test suite

## Quick Start

```javascript
import { ObservableService } from './src/main.js';

// Create an observable with initial state
const store = new ObservableService({
  user: { name: 'John', age: 30 },
  todos: [],
  theme: 'light'
});

// Subscribe to changes
store.subscribe((newState, oldState) => {
  console.log('State changed!', { newState, oldState });
});

// Update state - triggers notification
store.state.user.name = 'Jane';
store.state.todos.push({ id: 1, text: 'Learn observables' });
```

## Installation

This is a standalone utility. Simply download or clone the repository:

```bash
git clone https://github.com/dylarcher/util.observable.git
cd util.observable
npm install  # Only needed for development dependencies
```

## Usage Examples

### Basic State Management

```javascript
import { ObservableService } from './src/main.js';

// Initialize with data
const appState = new ObservableService({
  count: 0,
  isLoading: false,
  user: null
});

// Subscribe to all changes
appState.subscribe((fresh, stale) => {
  console.log('New state:', fresh);
  console.log('Previous state:', stale);
});

// Make changes
appState.state.count = 10;
appState.state.isLoading = true;
appState.state.user = { id: 1, name: 'Alice' };
```

### Multiple Subscribers

```javascript
const store = new ObservableService({ messages: [] });

// UI update subscriber
store.subscribe((state) => {
  updateUI(state);
});

// Analytics subscriber
store.subscribe((newState, oldState) => {
  trackAnalytics({
    event: 'state_change',
    changes: getChanges(oldState, newState)
  });
});

// Logger subscriber
store.subscribe((state) => {
  console.log('State updated:', state);
});
```

### Working with Complex Data

```javascript
const todoApp = new ObservableService({
  todos: [],
  filter: 'all',
  user: { preferences: { theme: 'dark' } }
});

// Add a todo
todoApp.state.todos.push({
  id: Date.now(),
  text: 'Build awesome app',
  completed: false
});

// Update nested properties
todoApp.state.user.preferences.theme = 'light';

// Delete properties
delete todoApp.state.filter;
```

### Subscription Management

```javascript
const store = new ObservableService({ data: 'initial' });

// Create subscriber functions
const logger = (state) => console.log('Log:', state);
const renderer = (state) => render(state);

// Subscribe
store.subscribe(logger);
store.subscribe(renderer);

// Unsubscribe specific subscriber
store.unsubscribe(logger);

// Remove all subscribers
store.unsubscribeAll();
```

## API Reference

### Constructor

```javascript
new ObservableService(initialState = {})
```

Creates a new observable service instance.

- **initialState** (Object): Initial state object (optional, defaults to empty object)

### Properties

#### `state`

The reactive state object. All property assignments and deletions on this object will trigger notifications to subscribers.

```javascript
const service = new ObservableService({ count: 0 });
service.state.count = 5; // Triggers notification
```

### Methods

#### `subscribe(callback)`

Adds a subscriber function that will be called when state changes.

- **callback** (Function): Function to call on state changes
  - Receives `(newState, oldState)` as parameters
  - Both states are frozen objects (immutable)

```javascript
service.subscribe((fresh, stale) => {
  console.log('Changed from', stale, 'to', fresh);
});
```

#### `unsubscribe(callback)`

Removes a specific subscriber function.

- **callback** (Function): The exact function reference to remove

```javascript
const mySubscriber = (state) => console.log(state);
service.subscribe(mySubscriber);
service.unsubscribe(mySubscriber);
```

#### `unsubscribeAll()`

Removes all subscriber functions.

```javascript
service.unsubscribeAll();
```

## Development

### Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run the test suite using Node.js test runner |
| `npm run coverage` | Generate test coverage report (requires 100% coverage) |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run build` | Build the project (TypeScript compilation) |

### Running Tests

The project includes comprehensive tests in multiple formats:

```bash
# Run all tests
npm test

# Generate coverage report
npm run coverage

# View coverage in browser
open tests/coverage/index.html
```

### Test Files

- **`src/main.spec.js`** - Custom test runner with detailed console output
- **`src/main.test.js`** - Standard Node.js test format
- **`tests/utils.js`** - Custom testing utilities

### Coverage Requirements

This project maintains **100% test coverage** across:

- ✅ Lines: 100%
- ✅ Functions: 100%
- ✅ Branches: 100%
- ✅ Statements: 100%

## Dependencies

### Runtime Dependencies

**None!** This is a zero-dependency library.

### Development Dependencies

- **c8** (10.1.3) - Code coverage reporting
- **eslint** (^9.30.0) - Code linting
- **eslint-config-prettier** (^10.1.5) - ESLint + Prettier integration
- **prettier** (^3.6.2) - Code formatting

## Browser Support

Works in all modern browsers that support:

- Proxy API (ES2015+)
- Promise (ES2015+)
- Object.freeze (ES5+)

## Performance Characteristics

- **Batched Updates**: Multiple synchronous changes are batched into a single notification
- **Memory Efficient**: Uses WeakMap and Set for optimal memory usage
- **No Polling**: Uses Proxy traps for immediate change detection
- **Immutable Snapshots**: State objects are frozen to prevent accidental mutations

## Examples in the Wild

Check out the included demo:

```bash
# Serve the demo locally
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000/src/index.html
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure tests pass and coverage remains 100%
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

Made with ❤️ by [Dylan Archer](mailto:dylarcher@gmail.com)
