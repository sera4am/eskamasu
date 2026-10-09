import * as lodash from "es-toolkit/compat";
/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
declare const isValidStr: (str: unknown) => str is string;
/**
 * Returns value or a default. Detects functions and Promises automatically.
 * @param value - Value or thunk
 * @param els - Default value or thunk
 * @returns Value or default
 * @example valueOr('v','d') // 'v'
 * @example valueOr(asyncFetch(), 'fallback') // Promise resolves to fetched or fallback
 * @example await valueOr(() => cache.get(id), () => api.fetch(id))
 * @category Promise Utilities
 */
type MaybePromise<T> = T | Promise<T>;
type MaybeFunction<T> = T | (() => MaybePromise<T>);
type valueOrProps = {
    <T, E>(value: Promise<T | null | undefined>, els?: E | (() => MaybePromise<E>)): Promise<T | E | undefined | null>;
    <T, E>(value: () => Promise<T | null | undefined>, els?: E | (() => MaybePromise<E>)): Promise<T | E | undefined | null>;
    <T, E>(value: MaybeFunction<T | null | undefined>, els?: E | (() => E)): T | E | undefined | null;
};
declare const valueOr: valueOrProps;
type emptyOrProps = {
    <T, E>(value: Promise<T | null | undefined>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | null>;
    <T, E>(value: () => Promise<T | null | undefined>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | null>;
    <T, E>(value: MaybeFunction<T | null | undefined>, els?: E | ((val: T | null | undefined) => E)): T | E | null;
};
declare const emptyOr: emptyOrProps;
/**
 * Ensures that all given paths exist on the resolved value; otherwise returns a default.
 * Supports functions and Promises.
 * @param value - Object or thunk
 * @param paths - Paths to check
 * @param els - Default value or thunk receiving the resolved value
 * @returns Value or default
 * @example await hasOr(fetchUser(), ['profile.name','id'], null)
 * @example hasOr({a:{b:1}}, 'a.b', {}) // returns original object
 * @category Promise Utilities
 */
type hasOrProps = {
    <T, E>(value: Promise<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | undefined | null>;
    <T, E>(value: () => Promise<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | undefined | null>;
    <T, E>(value: MaybeFunction<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => E)): T | E | undefined | null;
};
declare const hasOr: hasOrProps;
/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
declare const isEmpty: (value: unknown) => boolean;
/**
 * Converts a value to number (full-width and comma aware). Returns null when invalid.
 * Optionally rounds using Number.toFixed when `toFixed` is provided.
 * @param value - Value to convert
 * @param toFixed - Fraction digits to round to (uses Number.toFixed)
 * @returns number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('1,234.56', 1) // 1234.6
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
declare const toNumber: (value: unknown, toFixed?: unknown) => number | null;
/**
 * Converts various inputs to boolean. Numbers: 0 -> false, non-zero -> true.
 * Strings: 'true'|'t'|'y'|'yes'|'ok' -> true; 'false'|'f'|'n'|'no'|'ng' -> false.
 * If a function or Promise is provided, it will be resolved recursively.
 * Returns the `undetected` fallback when the value cannot be interpreted (default null).
 * @param value - Value, thunk, or Promise
 * @param undetected - Fallback when value cannot be interpreted (default null)
 * @returns boolean or null (sync or Promise)
 * @category Core Functions
 */
type toBoolProps = {
    (value: Promise<unknown>, undetected?: boolean | null): Promise<boolean | null>;
    (value: unknown, undetected?: boolean | null): boolean | null;
};
declare const toBool: toBoolProps;
/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean;
/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
declare const waited: (func: () => void | Promise<void>, frameCount?: number) => void;
/**
 * Compares two values; if equal returns the value, otherwise returns the default.
 * null and undefined are considered equal. Promise-aware.
 * @param param1 - First value (or thunk/promise)
 * @param param2 - Second value (or thunk/promise)
 * @param els - Default value (or thunk)
 * @returns Value or default (sync or Promise)
 * @example equalsOr('a','a','d') // 'a'
 * @example await equalsOr(fetchStatus(),'ok','ng')
 * @example equalsOr(null, undefined, 'd') // null
 * @category Promise Utilities
 */
type equalsOrProps = {
    <T, E>(param1: Promise<T>, param2: MaybeFunction<MaybePromise<T>>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>;
    <T, E>(param1: MaybeFunction<T>, param2: Promise<T>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>;
    <T, E>(param1: () => Promise<T>, param2: MaybeFunction<MaybePromise<T>>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>;
    <T, E>(param1: MaybeFunction<T>, param2: MaybeFunction<T>, els?: E | (() => E)): T | E | null;
    <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | (() => MaybePromise<E>)): MaybePromise<T | E | undefined | null>;
};
declare const notEqualsOr: equalsOrProps;
declare const equalsOr: equalsOrProps;
/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
declare const parseJSON: <T = any>(str: string | object | null | undefined) => T | null;
/**
 * Stringifies objects/arrays; returns null for strings or numbers.
 * @param obj - Target object
 * @param replacer — A function that transforms the results.
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
type JsonStringifyReplacer = ((this: any, key: string, value: any) => any) | undefined;
type JsonStringifySpace = string | number | undefined;
type jsonStringifyProps = {
    (obj: Record<string, any>, replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string;
    (obj: any[], replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string;
    (obj: unknown, replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string | null;
};
declare const jsonStringify: jsonStringifyProps;
/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
declare const castArray: <T>(value: T | T[] | null | undefined) => T[];
/**
 * Computes differences between two objects. Supports deep paths. When `keyExcludes` is true,
 * the provided keys are excluded (top-level only) from diffing.
 * @param sourceValue - Source object
 * @param currentValue - Current object
 * @param keys - Keys to check (deep paths allowed)
 * @param options - { keyExcludes } to treat keys as excludes (top-level only)
 * @param finallyCallback - Called after diff computation (always if notEmptyCallback returned truthy)
 * @param notEmptyCallback - Called only when diff is not empty
 * @returns Diff object
 * @example changes(o1,o2,['name','profile.bio'])
 * @example changes(orig, curr, ['id','created_at'], { keyExcludes:true })
 * @example await changes(a,b,['x'],{}, async diff => save(diff))
 * @example changes(
 *   { profile:{ tags:['a','b'] } },
 *   { profile:{ tags:['a','c'] } },
 *   ['profile.tags[1]']
 * ) // => { profile:{ tags:{ 1:'c' } } }
 * @category Object Utilities
 */
declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(sourceValue: T, currentValue: E, keys?: string[], options?: ChangesOptions, finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>, notEmptyCallback?: ChangesAfterCallback<Record<string, any>>) => Record<string, any>;
declare const strWrap: (value: string, wrapper: string, whenInvalid?: any) => string | null | undefined;
/**
 * Executes a function and returns undefined if an error occurs.
 * For functions returning a Promise, returns undefined if the Promise is rejected.
 *
 * @template T - The return type of the function
 * @param fn - The function to execute
 * @returns The result of the function execution, or undefined on error
 *
 * @example
 * // Synchronous function
 * swallow(() => data.remove() )
 * // => undefined (error ignored)
 *
 * @example
 * // Asynchronous function
 * const data = await swallow(async () => await fetchData());
 * // => data or undefined
 */
declare const swallow: <T>(fn: () => T) => T extends Promise<infer U> ? Promise<U | undefined> : T | undefined;
/**
 * Maps over an array, treating errors as undefined.
 * When compact is true, filters out undefined results (errors).
 *
 * @template T - The array element type
 * @template U - The function return type
 * @param array - The array to process
 * @param fn - The function to apply to each element
 * @param compact - If true, filters out undefined results (errors) from the output
 * @returns Array of results, or Promise of results for async functions
 *
 * @example
 * // Keep errors as undefined
 * const results = swallowMap(items, item => processItem(item));
 * // => [result1, undefined, result3, ...]
 *
 * @example
 * // Filter out errors (compact)
 * const results = swallowMap(items, item => processItem(item), true);
 * // => [result1, result3, ...]
 *
 * @example
 * // Async processing
 * const data = await swallowMap(urls, async url => await fetch(url), true);
 * // => array of successful responses only
 */
declare const swallowMap: <T, U>(array: T[] | undefined | null, fn: (item: T, index: number) => U, compact?: boolean) => U extends Promise<infer V> ? Promise<V[]> : U[];
/**
 * Returns nesting depth of arrays. Non-array: 0; empty array: 1. Uses minimum depth for mixed nesting.
 * @param ary - Array
 * @returns Depth
 * @example arrayDepth([1]) // 1
 * @example arrayDepth([[1],[2]]) // 2
 * @example arrayDepth([[[1]]]) // 3
 * @example arrayDepth([[1,2], [[3],[4,5]]]) // 2 (uses minimum depth)
 * @example arrayDepth([]) // 1
 * @example arrayDepth('not array') // 0
 * @category Array Utilities
 */
declare const arrayDepth: (ary: unknown) => number;
/**
 * Validates whether the input is a syntactically valid email address.
 * - Returns false for null/undefined/empty values.
 * - Values containing leading/trailing spaces are treated as invalid.
 * - Case-insensitive for the domain/local-part check.
 * @param email - Value to validate
 * @returns true if the input is a valid email format
 * @example isValidEmail('user@example.com') // true
 * @example isValidEmail(' user@example.com ') // false
 * @example isValidEmail('not-an-email') // false
 * @category Type Guards
 */
declare const isValidEmail: (email: unknown) => boolean;
export type ChangesOptions = {
    keyExcludes?: boolean;
};
type ChangesAfterCallback<T> = (value: T) => any | Promise<any>;
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>;
export * from "es-toolkit/compat";
declare const isEmptyOrg: typeof lodash.isEmpty;
declare const toNumberOrg: typeof lodash.toNumber;
declare const castArrayOrg: typeof lodash.castArray;
export { isEmpty, toNumber, castArray, isEmptyOrg, toNumberOrg, castArrayOrg, toBool, boolIf, isValidStr, valueOr, emptyOr, hasOr, equalsOr, notEqualsOr, waited, parseJSON, jsonStringify, changes, strWrap, swallow, swallowMap, arrayDepth, isValidEmail, };
