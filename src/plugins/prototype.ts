import { negate } from "../index.js"

declare global {
    interface Array<T> {
        /**
         * Maps with negated predicate result (boolean array).
         * @param predicate - Predicate
         * @returns Boolean array
         * @example [1,2,3].notMap(n => n > 1) // [true,false,false]
         * @category Array Utilities
         */
        notMap(predicate: (item: T) => boolean): boolean[]
        /**
         * Filters by negated predicate (items that do NOT match).
         * @param predicate - Predicate
         * @returns Filtered items
         * @example [1,2,3].notFilter(n => n % 2 === 0) // [1,3]
         * @category Array Utilities
         */
        notFilter(predicate: (item: T) => boolean): T[]
    }
}

// ES Modules は1度しか評価されないので、重複 import されても prototype 拡張は1回だけ実行される
Array.prototype.notMap = function <T>(this: T[], predicate: (item: T) => boolean): boolean[] {
    return this.map(negate(predicate))
}

Array.prototype.notFilter = function <T>(this: T[], predicate: (item: T) => boolean): T[] {
    return this.filter(negate(predicate))
}

export {}
