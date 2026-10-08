import * as lodash from "es-toolkit/compat";
import JSON5 from "json5";
import { toHalfWidth } from "./util.js";
/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
const isValidStr = (str) => {
    if (lodash.isNil(str)) {
        return false;
    }
    if (lodash.isEmpty(str)) {
        return false;
    }
    return typeof str === "string";
};
const valueOr = (value, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (lodash.isNil(res) || isEmpty(res)) {
                if (typeof els === "function") {
                    return els();
                }
                return els;
            }
            return res;
        });
    }
    if (!lodash.isNil(resolvedValue) && !isEmpty(resolvedValue)) {
        return resolvedValue;
    }
    if (typeof els === "function") {
        return els();
    }
    return els;
};
const emptyOr = (value, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (lodash.isNil(res) || isEmpty(res)) {
                return null;
            }
            if (typeof els === "function") {
                return els(res);
            }
            return els;
        });
    }
    if (lodash.isNil(resolvedValue) || isEmpty(resolvedValue)) {
        return null;
    }
    if (typeof els === "function") {
        return els(resolvedValue);
    }
    return els;
};
const hasOr = (value, paths, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    const pathArray = Array.isArray(paths) ? paths : [paths];
    // パスが全て存在するかチェック
    const checkPaths = (val) => {
        if (lodash.isNil(val) || isEmpty(val))
            return false;
        return pathArray.every(path => lodash.has(val, path));
    };
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return els(res);
                }
                return els;
            }
            return res;
        });
    }
    if (!checkPaths(resolvedValue)) {
        if (typeof els === "function") {
            return els(resolvedValue);
        }
        return els;
    }
    return resolvedValue;
};
/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
const isEmpty = (value) => {
    if (lodash.isNil(value)) {
        return true;
    }
    if (lodash.isNumber(value)) {
        return false;
    }
    if (lodash.isBoolean(value)) {
        return false;
    }
    return lodash.isEmpty(value);
};
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
const toNumber = (value, toFixed) => {
    if (lodash.isNil(value)) {
        return null;
    }
    if (lodash.isNumber(value)) {
        return value;
    }
    if (isEmpty(value)) {
        return null;
    }
    let v = toHalfWidth(value);
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = lodash.toNumber(v.trim().replace(/,/g, ""));
    }
    else {
        v = lodash.toNumber(v);
    }
    if (!lodash.isNaN(v) && !lodash.isNil(toFixed)) {
        const f = lodash.toNumber(toFixed);
        v = parseFloat(v.toFixed(f));
    }
    if (lodash.isNaN(v)) {
        return null;
    }
    return v;
};
const toBool = (value, undetected = null) => {
    if (lodash.isNil(value)) {
        return false;
    }
    if (isEmpty(value)) {
        return false;
    }
    if (lodash.isBoolean(value)) {
        return value;
    }
    if (lodash.isNumber(value)) {
        return value !== 0;
    }
    const n = toNumber(value);
    if (n !== null)
        return !!n;
    if (typeof value === "string") {
        switch (value.toLowerCase()) {
            case "true":
            case "t":
            case "y":
            case "yes":
            case "ok":
                return true;
            case "false":
            case "f":
            case "n":
            case "no":
            case "ng":
                return false;
            default:
        }
    }
    if (typeof value === "function") {
        const r = value();
        if (r instanceof Promise) {
            return r.then(toBool);
        }
        return toBool(r);
    }
    return undetected;
};
/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
const boolIf = (value, defaultValue = false) => {
    if (lodash.isBoolean(value)) {
        return value;
    }
    if (lodash.isNumber(value)) {
        return !!value;
    }
    return defaultValue;
};
/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
const waited = (func, frameCount = 0) => {
    requestAnimationFrame(() => {
        if (frameCount > 0) {
            return waited(func, frameCount - 1);
        }
        const result = func();
        if (result instanceof Promise) {
            result.catch(console.error);
        }
    });
};
const notEqualsOr = (...args) => {
    if (args.length === 2) {
        return emptyOr(args[0], args[1]);
    }
    const [param1, param2, els] = args;
    const resolveIfFunction = (val) => {
        return typeof val === "function" ? val() : val;
    };
    const p1 = resolveIfFunction(param1);
    const p2 = resolveIfFunction(param2);
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise);
    if (hasPromise) {
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (lodash.isNil(v1) && lodash.isNil(v2)) {
                return resolveIfFunction(els);
            }
            if (lodash.isEqual(v1, v2)) {
                return resolveIfFunction(els);
            }
            return v1;
        });
    }
    if (lodash.isNil(p1) && lodash.isNil(p2)) {
        return resolveIfFunction(els);
    }
    if (lodash.isEqual(p1, p2)) {
        return resolveIfFunction(els);
    }
    return p1;
};
const equalsOr = (...args) => {
    if (args.length === 2) {
        return valueOr(args[0], args[1]);
    }
    const [param1, param2, els] = args;
    // 関数を解決するヘルパー
    const resolveIfFunction = (val) => {
        return typeof val === "function" ? val() : val;
    };
    // Promiseが含まれているかチェック
    const p1 = resolveIfFunction(param1);
    const p2 = resolveIfFunction(param2);
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise);
    if (hasPromise) {
        // Promise処理ブランチ
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (lodash.isNil(v1) && lodash.isNil(v2)) {
                return null;
            }
            if (lodash.isEqual(v1, v2)) {
                return v1;
            }
            // elsの解決
            if (typeof els === "function") {
                return els();
            }
            return els;
        });
    }
    else {
        // 同期処理ブランチ
        if (lodash.isNil(p1) && lodash.isNil(p2)) {
            return null;
        }
        if (lodash.isEqual(p1, p2)) {
            return p1;
        }
        // elsの解決
        if (typeof els === "function") {
            return els();
        }
        return els;
    }
};
/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
const parseJSON = (str) => {
    if (lodash.isNil(str)) {
        return null;
    }
    if (typeof str === "object") {
        return str;
    }
    try {
        return JSON5.parse(str);
    }
    catch {
        return null;
    }
};
const jsonStringify = (obj, replacer, space) => {
    if (lodash.isNil(obj)) {
        return null;
    }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj);
            return JSON.stringify(j, replacer, space);
        }
        catch {
            return null;
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj, replacer, space);
        }
        catch {
            return null;
        }
    }
    return null;
};
/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
const castArray = (value) => {
    if (lodash.isNil(value)) {
        return [];
    }
    return lodash.castArray(value);
};
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
const changes = (sourceValue, currentValue, keys, options, finallyCallback, notEmptyCallback) => {
    const diff = {};
    if (lodash.isEmpty(keys)) {
        keys = [];
        options = { ...options, keyExcludes: true };
    }
    // keyExcludes時にdeep pathが指定されていたら警告
    if (options?.keyExcludes === true) {
        const hasDeepPath = keys.some(k => k.includes('.') || k.includes('['));
        if (hasDeepPath) {
            console.warn('[eskamasu.changes] keyExcludes mode does not support deep paths. ' +
                'Keys with "." or "[" will be treated as literal property names.');
        }
    }
    const targetKeys = options?.keyExcludes === true
        ? lodash.difference(lodash.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)]), keys)
        : keys;
    for (const key of targetKeys) {
        const v1 = options?.keyExcludes === true ? sourceValue[key] : lodash.get(sourceValue, key);
        const v2 = options?.keyExcludes === true ? currentValue[key] : lodash.get(currentValue, key);
        if (lodash.isNil(v1) && lodash.isNil(v2))
            continue;
        if (lodash.isNil(v1) || lodash.isNil(v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                lodash.set(diff, key, v2 ?? null);
            }
            continue;
        }
        if (!lodash.isEqual(v1, v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                lodash.set(diff, key, v2 ?? null);
            }
        }
    }
    let notEmptyRes = true;
    if (!isEmpty(diff) && notEmptyCallback) {
        notEmptyRes = notEmptyCallback(diff);
        if (notEmptyRes instanceof Promise) {
            return notEmptyRes.then(async (res) => {
                res && await Promise.resolve(finallyCallback?.(diff, res));
                return diff;
            });
        }
    }
    if (finallyCallback && notEmptyRes) {
        const finallyRes = finallyCallback(diff, notEmptyRes);
        if (finallyRes instanceof Promise) {
            return finallyRes.then(() => diff);
        }
    }
    return diff;
};
const strWrap = (value, wrapper, whenInvalid = undefined) => {
    if (!isValidStr(value)) {
        return whenInvalid;
    }
    return `${wrapper}${value}${wrapper}`;
};
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
const swallow = (fn) => {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.catch(() => undefined);
        }
        return result;
    }
    catch {
        return undefined;
    }
};
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
const swallowMap = (array, fn, compact) => {
    if (!array)
        return [];
    const results = array.map((item, index) => {
        try {
            const result = fn(item, index);
            if (result instanceof Promise) {
                return result.catch(() => undefined);
            }
            return result;
        }
        catch {
            return undefined;
        }
    });
    if (results.some(r => r instanceof Promise)) {
        return Promise.all(results).then(resolved => compact ? resolved.filter(Boolean) : resolved);
    }
    return (compact ? results.filter(Boolean) : results);
};
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
const arrayDepth = (ary) => {
    if (!Array.isArray(ary)) {
        return 0;
    }
    if (lodash.size(ary) === 0) {
        return 1;
    }
    return 1 + Math.min(...ary.map(arrayDepth));
};
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
const isValidEmail = (email) => {
    if (isEmpty(email)) {
        return false;
    }
    const str = String(email).toLowerCase();
    if (isEmpty(str)) {
        return false;
    }
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
};
// namespace import には default (toolkit 関数) が含まれるので除外して展開する
const { default: _toolkit, ...compatFunctions } = lodash;
// 変数名を _ にすることで、VS Code の auto import 候補が `_` として表示される
const _ = {
    ...compatFunctions,
    isEmptyOrg: lodash.isEmpty,
    toNumberOrg: lodash.toNumber,
    castArrayOrg: lodash.castArray,
    strWrap,
    isEmpty,
    toNumber,
    toBool,
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
    emptyOr,
    notEqualsOr,
    hasOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    swallow,
    swallowMap,
    arrayDepth,
    isValidEmail,
    __plugins: new Set(),
};
export default _;
// 個別エクスポートはそのまま
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, notEqualsOr, waited, parseJSON, jsonStringify, castArray, changes, strWrap, swallow, swallowMap, arrayDepth, isValidEmail, };
