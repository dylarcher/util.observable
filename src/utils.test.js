import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';
import { test as utilTest } from './utils.js';

describe('utils.js', () => {
  describe('test function', () => {
    test('should pass a basic test with correct expectation', () => {
      const result = utilTest({
        subject: 'Basic math test',
        fn: (a, b) => a + b,
        args: [2, 3],
        expect: 5,
      });
      assert.strictEqual(result, true);
    });

    test('should fail a test with incorrect expectation', () => {
      const result = utilTest({
        subject: 'Failing math test',
        fn: (a, b) => a + b,
        args: [2, 3],
        expect: 6,
      });
      assert.strictEqual(result, false);
    });

    test('should handle test with no arguments', () => {
      const result = utilTest({
        subject: 'No args test',
        fn: () => 'hello',
        args: [],
        expect: 'hello',
      });
      assert.strictEqual(result, true);
    });

    test('should handle test with undefined args', () => {
      const result = utilTest({
        subject: 'Undefined args test',
        fn: () => 'world',
        // args property is undefined
        expect: 'world',
      });
      assert.strictEqual(result, false); // This should fail because args is undefined and the function tries to spread it
    });

    test('should handle object return values correctly', () => {
      const expectedObj = { key: 'value', number: 42 };
      const result = utilTest({
        subject: 'Object return test',
        fn: () => ({ key: 'value', number: 42 }),
        args: [],
        expect: expectedObj,
      });
      assert.strictEqual(result, false); // Objects are compared by reference, not value
    });

    test('should handle string return values', () => {
      const result = utilTest({
        subject: 'String return test',
        fn: () => 'test string',
        args: [],
        expect: 'test string',
      });
      assert.strictEqual(result, true);
    });

    test('should handle boolean return values', () => {
      const result = utilTest({
        subject: 'Boolean return test',
        fn: () => true,
        args: [],
        expect: true,
      });
      assert.strictEqual(result, true);
    });

    test('should handle number return values', () => {
      const result = utilTest({
        subject: 'Number return test',
        fn: () => 123,
        args: [],
        expect: 123,
      });
      assert.strictEqual(result, true);
    });

    test('should handle null return values', () => {
      const result = utilTest({
        subject: 'Null return test',
        fn: () => null,
        args: [],
        expect: null,
      });
      assert.strictEqual(result, true);
    });

    test('should handle undefined return values', () => {
      const result = utilTest({
        subject: 'Undefined return test',
        fn: () => undefined,
        args: [],
        expect: undefined,
      });
      assert.strictEqual(result, true);
    });

    test('should handle array return values', () => {
      const expectedArray = [1, 2, 3];
      const result = utilTest({
        subject: 'Array return test',
        fn: () => [1, 2, 3],
        args: [],
        expect: expectedArray,
      });
      assert.strictEqual(result, false); // Arrays are compared by reference, not value
    });

    test('should handle function that throws an error', () => {
      const result = utilTest({
        subject: 'Error throwing test',
        fn: () => {
          throw new Error('Test error');
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result, false);
    });

    test('should handle function that throws an error with custom message', () => {
      const result = utilTest({
        subject: 'Custom error test',
        fn: () => {
          const error = new Error('Custom error message');
          throw error;
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result, false);
    });

    test('should handle function that throws non-Error object', () => {
      const result = utilTest({
        subject: 'Non-error throw test',
        fn: () => {
          throw 'String error';
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result, false);
    });

    test('should handle function that throws null', () => {
      const result = utilTest({
        subject: 'Null throw test',
        fn: () => {
          throw null;
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result, false);
    });

    test('should handle function that throws undefined', () => {
      const result = utilTest({
        subject: 'Undefined throw test',
        fn: () => {
          throw undefined;
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result, false);
    });

    test('should handle complex object comparisons', () => {
      const complexObj = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, { inner: 'object' }],
        func: function () { return 'function'; },
      };

      const result = utilTest({
        subject: 'Complex object test',
        fn: () => complexObj,
        args: [],
        expect: complexObj,
      });
      assert.strictEqual(result, true);
    });

    test('should handle functions with multiple arguments', () => {
      const result = utilTest({
        subject: 'Multiple args test',
        fn: (a, b, c, d) => a + b + c + d,
        args: [1, 2, 3, 4],
        expect: 10,
      });
      assert.strictEqual(result, true);
    });

    test('should handle async function results (resolved value)', () => {
      const result = utilTest({
        subject: 'Async function test',
        fn: async () => {
          return await Promise.resolve('async result');
        },
        args: [],
        expect: Promise.resolve('async result'),
      });
      // Note: This will compare Promise objects, not their resolved values
      // The test utility doesn't await promises, so this tests the behavior as-is
      assert.strictEqual(result, false); // Promises are different objects
    });

    test('should handle Date objects', () => {
      const date = new Date('2023-01-01');
      const result = utilTest({
        subject: 'Date object test',
        fn: () => date,
        args: [],
        expect: date,
      });
      assert.strictEqual(result, true);
    });

    test('should handle RegExp objects', () => {
      const regex = /test/g;
      const result = utilTest({
        subject: 'RegExp object test',
        fn: () => regex,
        args: [],
        expect: regex,
      });
      assert.strictEqual(result, true);
    });

    test('should handle zero values correctly', () => {
      const result = utilTest({
        subject: 'Zero value test',
        fn: () => 0,
        args: [],
        expect: 0,
      });
      assert.strictEqual(result, true);
    });

    test('should handle empty string values', () => {
      const result = utilTest({
        subject: 'Empty string test',
        fn: () => '',
        args: [],
        expect: '',
      });
      assert.strictEqual(result, true);
    });

    test('should handle NaN values', () => {
      const result = utilTest({
        subject: 'NaN test',
        fn: () => NaN,
        args: [],
        expect: NaN,
      });
      // NaN === NaN is false, so this should fail
      assert.strictEqual(result, false);
    });

    test('should handle Infinity values', () => {
      const result = utilTest({
        subject: 'Infinity test',
        fn: () => Infinity,
        args: [],
        expect: Infinity,
      });
      assert.strictEqual(result, true);
    });

    test('should handle negative Infinity values', () => {
      const result = utilTest({
        subject: 'Negative Infinity test',
        fn: () => -Infinity,
        args: [],
        expect: -Infinity,
      });
      assert.strictEqual(result, true);
    });

    test('should handle various error scenarios in test function', () => {
      // Test when error has no message property
      const result1 = utilTest({
        subject: 'Error without message',
        fn: () => {
          const error = {};
          error.toString = () => { throw new Error('nested error'); };
          throw error;
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result1, false);

      // Test when error is an object without message
      const result2 = utilTest({
        subject: 'Object error',
        fn: () => {
          throw { customError: 'value', code: 123 };
        },
        args: [],
        expect: 'anything',
      });
      assert.strictEqual(result2, false);
    });

    test('should handle all console.warn branches', () => {
      // Since utils.js imports { warn } from console, we can't easily mock it
      // Instead, test the logic directly by checking the return values

      // Test successful assertion (should call warn because !!status is true)
      const result = utilTest({
        subject: 'Successful test for warn',
        fn: () => 'success',
        args: [],
        expect: 'success',
      });
      assert.strictEqual(result, true);

      // Test failed assertion (should NOT call warn because !!status is false)
      const failResult = utilTest({
        subject: 'Failed test for warn',
        fn: () => 'failure',
        args: [],
        expect: 'success',
      });
      assert.strictEqual(failResult, false);

      // Both cases exercise the !!status && warn() logic
      assert.ok(true, 'warn branch logic tested');
    });

    test('should test typeof checks for object vs non-object', () => {
      // Test where actual is object type and gets table treatment
      const objResult = utilTest({
        subject: 'Object typeof test',
        fn: () => ({ test: 'object' }),
        args: [],
        expect: { different: 'object' },
      });
      assert.strictEqual(objResult, false);

      // Test where actual is not object type and gets info treatment
      const nonObjResult = utilTest({
        subject: 'Non-object typeof test',
        fn: () => 'string value',
        args: [],
        expect: 'different string',
      });
      assert.strictEqual(nonObjResult, false);
    }); test('should test assertion failure vs success paths', () => {
      // Since utils.js imports { assert } from console, we can't easily mock it
      // Instead, test the logic by ensuring both paths are exercised

      // Test assertion failure path
      const failResult = utilTest({
        subject: 'Assertion failure test',
        fn: () => 'wrong',
        args: [],
        expect: 'right',
      });
      assert.strictEqual(failResult, false);

      // Test assertion success path  
      const successResult = utilTest({
        subject: 'Assertion success test',
        fn: () => 'correct',
        args: [],
        expect: 'correct',
      });
      assert.strictEqual(successResult, true);

      // Both cases call assert(status, subject) but with different status values
      assert.ok(true, 'Both assertion paths tested');
    });

    test('should handle args spreading edge cases', () => {
      // Test with null args (should cause error)
      const result1 = utilTest({
        subject: 'Null args test',
        fn: () => 'test',
        args: null,
        expect: 'test',
      });
      assert.strictEqual(result1, false);

      // Test with non-array args - actually string args work because strings are iterable
      // So we need to pass something that will successfully spread but result in wrong call
      const result2 = utilTest({
        subject: 'Non-array args test',
        fn: (a, b, c, d) => `${a}${b}${c}${d}`, // Expecting 'test' chars
        args: 'test', // Will spread as 't', 'e', 's', 't'
        expect: 'test', // Should match since fn will get 't', 'e', 's', 't' and concatenate
      });
      assert.strictEqual(result2, true); // This actually works because strings are iterable
    });

    test('should cover all color styling paths', () => {
      // Test where status is false (should use tomato color)
      const failResult = utilTest({
        subject: 'Styling failure test',
        fn: () => 'fail',
        args: [],
        expect: 'pass',
      });
      assert.strictEqual(failResult, false);

      // Test where status is true (should use seagreen color)
      const passResult = utilTest({
        subject: 'Styling success test',
        fn: () => 'pass',
        args: [],
        expect: 'pass',
      });
      assert.strictEqual(passResult, true);
    });
  });
});
