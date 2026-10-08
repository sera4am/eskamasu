import _ from "../index.js";
const PLUGIN_NAME = "prototype";
if (!_.__plugins.has(PLUGIN_NAME)) {
    _.__plugins.add(PLUGIN_NAME);
    Array.prototype.notMap = function (predicate) {
        return this.map(_.negate(predicate));
    };
    Array.prototype.notFilter = function (predicate) {
        return this.filter(_.negate(predicate));
    };
}
