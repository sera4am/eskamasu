import { negate } from "../index.js";
// ES Modules は1度しか評価されないので、重複 import されても prototype 拡張は1回だけ実行される
Array.prototype.notMap = function (predicate) {
    return this.map(negate(predicate));
};
Array.prototype.notFilter = function (predicate) {
    return this.filter(negate(predicate));
};
