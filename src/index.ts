import * as lodash from "es-toolkit/compat"

// es-toolkit/compat の namespace から default (toolkit 関数) を除いたもの = lodash 互換 API 全体
type EsToolkitCompat = Omit<typeof lodash, "default">
import JSON5 from "json5"
import { toHalfWidth } from "./util.js"

/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
const isValidStr = (str: unknown): str is string => {
    if (lodash.isNil(str)) { return false }
    if (lodash.isEmpty(str)) { return false }
    return typeof str === "string"
}


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
type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)

type valueOrProps = {
    <T, E>(value: Promise<T | null | undefined>, els?: E | (() => MaybePromise<E>)): Promise<T | E | undefined | null>
    <T, E>(value: () => Promise<T | null | undefined>, els?: E | (() => MaybePromise<E>)): Promise<T | E | undefined | null>
    <T, E>(value: MaybeFunction<T | null | undefined>, els?: E | (() => E)): T | E | undefined | null
}
const valueOr: valueOrProps = (value: any, els?: any): any => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => any)()
        : value

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (lodash.isNil(res) || isEmpty(res)) {
                if (typeof els === "function") {
                    return (els as () => any)()
                }
                return els
            }
            return res
        })
    }
    if (!lodash.isNil(resolvedValue) && !isEmpty(resolvedValue)) {
        return resolvedValue
    }
    if (typeof els === "function") {
        return (els as () => any)()
    }
    return els
}

type emptyOrProps = {
    <T, E>(value: Promise<T | null | undefined>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | null>
    <T, E>(value: () => Promise<T | null | undefined>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | null>
    <T, E>(value: MaybeFunction<T | null | undefined>, els?: E | ((val: T | null | undefined) => E)): T | E | null
}
const emptyOr: emptyOrProps = (value: any, els?: any): any => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => any)()
        : value

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (lodash.isNil(res) || isEmpty(res)) {
                return null
            }
            if (typeof els === "function") {
                return (els as (val: any) => any)(res)
            }
            return els
        })
    }
    if (lodash.isNil(resolvedValue) || isEmpty(resolvedValue)) {
        return null
    }
    if (typeof els === "function") {
        return (els as (val: any) => any)(resolvedValue)
    }
    return els
}


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
    <T, E>(value: Promise<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | undefined | null>
    <T, E>(value: () => Promise<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => MaybePromise<E>)): Promise<T | E | undefined | null>
    <T, E>(value: MaybeFunction<T | null | undefined>, paths: string | string[], els?: E | ((val: T | null | undefined) => E)): T | E | undefined | null
}
const hasOr: hasOrProps = (value: any, paths: string | string[], els?: any): any => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => any)()
        : value

    const pathArray = Array.isArray(paths) ? paths : [paths]

    // パスが全て存在するかチェック
    const checkPaths = (val: any) => {
        if (lodash.isNil(val) || isEmpty(val)) return false
        return pathArray.every(path => lodash.has(val, path))
    }

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return (els as (val: any) => any)(res)
                }
                return els
            }
            return res
        })
    }
    if (!checkPaths(resolvedValue)) {
        if (typeof els === "function") {
            return (els as (val: any) => any)(resolvedValue)
        }
        return els
    }
    return resolvedValue
}

/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
const isEmpty = (value: unknown): boolean => {
    if (lodash.isNil(value)) { return true }
    if (lodash.isNumber(value)) { return false }
    if (lodash.isBoolean(value)) { return false }
    return lodash.isEmpty(value)
}

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
const toNumber = (value: unknown, toFixed?:unknown): number | null => {
    if (lodash.isNil(value)) { return null }
    if (lodash.isNumber(value)) { return value as number }
    if (isEmpty(value)) { return null }
    let v: string | number | null = toHalfWidth(value as string | number)
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = lodash.toNumber(v.trim().replace(/,/g, ""))
    } else {
        v = lodash.toNumber(v)
    }
    if (!lodash.isNaN(v) && !lodash.isNil(toFixed)) {
        const f = lodash.toNumber(toFixed)
        v = parseFloat(v.toFixed(f))
    }
    if (lodash.isNaN(v)) { return null }
    return v as number
}

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
    (value: Promise<unknown>, undetected?: boolean | null): Promise<boolean | null>
    (value: unknown, undetected?: boolean | null): boolean | null
}
const toBool:toBoolProps = (value: any, undetected: boolean | null = null): any => {
    if (lodash.isNil(value)) { return false }
    if (isEmpty(value)) { return false }
    if (lodash.isBoolean(value)) { return value }
    if (lodash.isNumber(value)) { return value !== 0 }
    const n = toNumber(value)
    if (n !== null) return !!n

    if (typeof value === "string") {
        switch (value.toLowerCase()) {
            case "true":
            case "t":
            case "y":
            case "yes":
            case "ok":
                return true
            case "false":
            case "f":
            case "n":
            case "no":
            case "ng":
                return false
            default:

        }
    }
    if (typeof value === "function") {
        const r = value()
        if (r instanceof Promise) {
            return r.then(toBool)
        }
        return toBool(r)
    }
    return undetected
}

/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
const boolIf = (value: unknown, defaultValue: boolean = false): boolean => {
    if (lodash.isBoolean(value)) { return value as boolean }
    if (lodash.isNumber(value)) { return !!value }
    return defaultValue
}

/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
const waited = (func: () => void | Promise<void>, frameCount: number = 0): void => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waited(func, frameCount - 1) }
        const result = func()
        if (result instanceof Promise) { result.catch(console.error) }
    })
}

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
    <T, E>(param1: Promise<T>, param2: MaybeFunction<MaybePromise<T>>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>
    <T, E>(param1: MaybeFunction<T>, param2: Promise<T>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>
    <T, E>(param1: () => Promise<T>, param2: MaybeFunction<MaybePromise<T>>, els?: E | (() => MaybePromise<E>)): Promise<T | E | null>
    <T, E>(param1: MaybeFunction<T>, param2: MaybeFunction<T>, els?: E | (() => E)): T | E | null
    <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | (() => MaybePromise<E>)): MaybePromise<T | E | undefined | null>
}

const notEqualsOr: equalsOrProps = (...args: any[]): any => {
    if (args.length === 2) {
        return emptyOr(args[0], args[1])
    }
    const [param1, param2, els] = args

    const resolveIfFunction = (val: any): any => {
        return typeof val === "function" ? (val as () => any)(): val
    }

    const p1 = resolveIfFunction(param1)
    const p2 = resolveIfFunction(param2)
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise)

    if (hasPromise) {
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (lodash.isNil(v1) && lodash.isNil(v2)) { return resolveIfFunction(els) }
            if (lodash.isEqual(v1, v2)) { return resolveIfFunction(els) }
            return v1
        })
    }
    if (lodash.isNil(p1) && lodash.isNil(p2)) { return resolveIfFunction(els) }
    if (lodash.isEqual(p1, p2)) { return resolveIfFunction(els) }
    return p1
}

const equalsOr: equalsOrProps = (...args: any[]): any => {
    if (args.length === 2) {
        return valueOr(args[0], args[1])
    }
    const [param1, param2, els] = args

    // 関数を解決するヘルパー
    const resolveIfFunction = (val: any): any => {
        return typeof val === "function" ? (val as () => any)() : val
    }

    // Promiseが含まれているかチェック
    const p1 = resolveIfFunction(param1)
    const p2 = resolveIfFunction(param2)
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise)

    if (hasPromise) {
        // Promise処理ブランチ
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (lodash.isNil(v1) && lodash.isNil(v2)) { return null }
            if (lodash.isEqual(v1, v2)) {
                return v1
            }
            // elsの解決
            if (typeof els === "function") {
                return (els as () => any)()
            }
            return els
        })
    } else {
        // 同期処理ブランチ
        if (lodash.isNil(p1) && lodash.isNil(p2)) { return null }
        if (lodash.isEqual(p1, p2)) {
            return p1
        }
        // elsの解決
        if (typeof els === "function") {
            return (els as () => any)()
        }
        return els
    }
}

/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
const parseJSON = <T = any>(str: string | object | null | undefined): T | null => {
    if (lodash.isNil(str)) { return null }
    if (typeof str === "object") {
        return str as T
    }
    try {
        return JSON5.parse(str) as T
    } catch {
        return null
    }
}

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
type JsonStringifyReplacer = ((this: any, key: string, value: any) => any) | undefined
type JsonStringifySpace = string | number | undefined
type jsonStringifyProps = {
    (obj: Record<string, any>, replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string
    (obj: any[], replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string
    (obj: unknown, replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): string | null
}
const jsonStringify: jsonStringifyProps = (obj: unknown, replacer?: JsonStringifyReplacer, space?: JsonStringifySpace): any => {
    if (lodash.isNil(obj)) { return null }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj)
            return JSON.stringify(j, replacer, space)
        } catch {
            return null
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj, replacer, space)
        } catch {
            return null
        }
    }
    return null
}

/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
const castArray = <T>(value: T | T[] | null | undefined): T[] => {
    if (lodash.isNil(value)) { return [] }
    return lodash.castArray(value) as T[]
}

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
const changes = <T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys?: string[],
    options?: ChangesOptions,
    finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>,
    notEmptyCallback?: ChangesAfterCallback<Record<string, any>>
): Record<string, any> => {
    const diff: Record<string, any> = {}

    if (lodash.isEmpty(keys)) {
        keys = []
        options = {...options, keyExcludes: true}
    }

    // keyExcludes時にdeep pathが指定されていたら警告
    if (options?.keyExcludes === true) {
        const hasDeepPath = keys!!.some(k => k.includes('.') || k.includes('['))
        if (hasDeepPath) {
            console.warn(
                '[eskamasu.changes] keyExcludes mode does not support deep paths. ' +
                'Keys with "." or "[" will be treated as literal property names.'
            )
        }
    }

    const targetKeys: string[] = options?.keyExcludes === true
        ? lodash.difference(
            lodash.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)]),
            keys!!
        )
        : keys!!

    for (const key of targetKeys) {
        const v1 = options?.keyExcludes === true ? sourceValue[key] : lodash.get(sourceValue, key)
        const v2 = options?.keyExcludes === true ? currentValue[key] : lodash.get(currentValue, key)

        if (lodash.isNil(v1) && lodash.isNil(v2)) continue
        if (lodash.isNil(v1) || lodash.isNil(v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null
            } else {
                lodash.set(diff, key, v2 ?? null)
            }
            continue
        }
        if (!lodash.isEqual(v1, v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null
            } else {
                lodash.set(diff, key, v2 ?? null)
            }
        }
    }

    let notEmptyRes: any = true
    if (!isEmpty(diff) && notEmptyCallback) {
        notEmptyRes = notEmptyCallback(diff)
        if (notEmptyRes instanceof Promise) {
            return notEmptyRes.then(async res => {
                res && await Promise.resolve(finallyCallback?.(diff, res))
                return diff
            })
        }
    }
    if (finallyCallback && notEmptyRes) {
        const finallyRes = finallyCallback(diff, notEmptyRes)
        if (finallyRes instanceof Promise) {
            return finallyRes.then(() => diff)
        }
    }
    return diff
}

const strWrap = (value: string, wrapper: string, whenInvalid:any = undefined): string | null | undefined => {
    if (!isValidStr(value)) { return whenInvalid }
    return `${wrapper}${value}${wrapper}`
}

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
const swallow = <T>(fn: () => T): T extends Promise<infer U> ? Promise<U | undefined> : T | undefined => {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.catch(() => undefined) as any;
        }
        return result as any;
    } catch {
        return undefined as any;
    }
}

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
const swallowMap = <T, U>(
    array: T[] | undefined | null,
    fn: (item: T, index: number) => U,
    compact?: boolean
): U extends Promise<infer V> ? Promise<V[]> : U[] => {

    if (!array) return [] as any;

    const results = array.map((item, index) => {
        try {
            const result = fn(item, index);
            if (result instanceof Promise) {
                return result.catch(() => undefined);
            }
            return result;
        } catch {
            return undefined;
        }
    });

    if (results.some(r => r instanceof Promise)) {
        return Promise.all(results).then(resolved =>
            compact ? resolved.filter(Boolean) : resolved
        ) as any;
    }

    return (compact ? results.filter(Boolean) : results) as any;
}


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
const arrayDepth = (ary: unknown): number => {
    if (!Array.isArray(ary)) { return 0 }
    if (lodash.size(ary) === 0) { return 1 }
    return 1 + Math.min(...(ary as []).map(arrayDepth))
}

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
const isValidEmail = (email: unknown): boolean => {
    if (isEmpty(email)) { return false }
    const str = String(email).toLowerCase()
    if (isEmpty(str)) { return false }
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(str)
}

export type ChangesOptions = {
    keyExcludes?: boolean
}

type ChangesAfterCallback<T> = (value: T) => any | Promise<any>
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>

// eskamasu で上書き / 削除する es-toolkit/compat のキー
type EskamasuOverriddenKeys = 'isEmpty' | 'toNumber' | 'castArray' | 'extend'

/**
 * eskamasu 本体の型。es-toolkit/compat の全関数 (上書き対象を除く) をそのまま継承し、
 * eskamasu 独自関数を追加した形になる。
 *
 * プラグインを読み込むと、各プラグインの d.ts に書かれた declaration merging により
 * このインターフェースが自動的に拡張される。
 */
export interface EskamasuType extends Omit<EsToolkitCompat, EskamasuOverriddenKeys> {
    // eskamasu 独自関数
    isValidStr: typeof isValidStr
    valueOr: typeof valueOr
    emptyOr: typeof emptyOr
    hasOr: typeof hasOr
    toBool: typeof toBool
    boolIf: typeof boolIf
    waited: typeof waited
    equalsOr: typeof equalsOr
    notEqualsOr: typeof notEqualsOr
    parseJSON: typeof parseJSON
    jsonStringify: typeof jsonStringify
    changes: typeof changes
    swallow: typeof swallow
    swallowMap: typeof swallowMap
    arrayDepth: typeof arrayDepth
    strWrap: typeof strWrap
    isValidEmail: typeof isValidEmail

    // eskamasu で挙動を上書きしている関数
    isEmpty: typeof isEmpty
    toNumber: typeof toNumber
    castArray: typeof castArray

    // 上書き前の es-toolkit/compat オリジナル
    isEmptyOrg: typeof lodash.isEmpty
    toNumberOrg: typeof lodash.toNumber
    castArrayOrg: typeof lodash.castArray

    /**
     * 登録済みプラグイン名のレジストリ。
     * プラグインの side-effect import 時に重複登録を防ぐために使用される。
     * 通常コードから直接触らないこと。
     * @internal
     */
    __plugins: Set<string>
}

// namespace import には default (toolkit 関数) が含まれるので除外して展開する
const { default: _toolkit, ...compatFunctions } = lodash as any

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
    __plugins: new Set<string>(),
} as EskamasuType
export default _

// 個別エクスポートはそのまま
export {
    isEmpty,
    toNumber,
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
    notEqualsOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    strWrap,
    swallow,
    swallowMap,
    arrayDepth,
    isValidEmail,
}
