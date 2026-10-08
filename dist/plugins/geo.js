import * as turf from "@turf/turf";
import _ from "../index.js";
/**
 * Geometry type selector for conversions. Use `auto` to try higher dimensions first.
 */
export var GeomType;
(function (GeomType) {
    GeomType[GeomType["point"] = 0] = "point";
    GeomType[GeomType["polygon"] = 1] = "polygon";
    GeomType[GeomType["lineString"] = 2] = "lineString";
    GeomType[GeomType["multiPoint"] = 3] = "multiPoint";
    GeomType[GeomType["multiPolygon"] = 4] = "multiPolygon";
    GeomType[GeomType["multiLineString"] = 5] = "multiLineString";
    GeomType["auto"] = "auto";
})(GeomType || (GeomType = {}));
const PLUGIN_NAME = "geo";
if (!_.__plugins.has(PLUGIN_NAME)) {
    _.__plugins.add(PLUGIN_NAME);
    /**
     * Converts a coordinate-like value to a [lng, lat] tuple, optionally rounding digits.
     * Swaps order if lat/lng appear to be inverted. Returns null when invalid.
     * @internal
     */
    const toLngLatArray = (coord, digit) => {
        if (_.isNil(coord)) {
            return null;
        }
        let tLat = null;
        let tLng = null;
        if (Array.isArray(coord) && _.isNumber(coord[0]) && _.isNumber(coord[1])) {
            tLng = _.toNumber(coord[0]);
            tLat = _.toNumber(coord[1]);
        }
        else {
            if (typeof coord !== "object") {
                return null;
            }
            tLng = _.toNumber(coord.lng ?? coord.lon ?? coord.longitude);
            tLat = _.toNumber(coord.lat ?? coord.latitude);
        }
        if (!tLat || !tLng) {
            return null;
        }
        if (((tLat < -90 || tLat > 90) && (tLng > -90 && tLng < 90)) ||
            ((tLng < -180 || tLng > 180) && (tLat > -180 && tLat < 180))) {
            const t = tLat;
            tLat = tLng;
            tLat = t;
        }
        return [
            (_.isNumber(digit) ? _.toNumber(tLng.toFixed(digit)) : tLng),
            (_.isNumber(digit) ? _.toNumber(tLat.toFixed(digit)) : tLat)
        ];
    };
    /**
     * Converts coordinates or an object to a Point GeoJSON.
     * @param geo - [lng,lat] or {lat,lng}
     * @param digit - Rounding digits
     * @returns Point or null
     * @example toPointGeoJson([139.7671,35.6812])
     * @example toPointGeoJson({ lat:35.6895, lng:139.6917 })
     * @category Geo Utilities
     */
    const toPointGeoJson = (geo, digit) => {
        let lngLat = null;
        if (_.isEmpty(geo)) {
            return null;
        }
        if (Array.isArray(geo)) {
            if (_.size(geo) === 1) {
                lngLat = toLngLatArray(geo[0], digit);
            }
            else {
                lngLat = toLngLatArray(geo, digit);
            }
        }
        else if (_.has(geo, "lat") || _.has(geo, "latitude")) {
            lngLat = toLngLatArray(geo, digit);
        }
        else if (_.has(geo, "type")) {
            switch (geo.type.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "point") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    lngLat = toLngLatArray(_.get(geo, "features[0].geometry.coordinates"), digit);
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "point") {
                        return null;
                    }
                    lngLat = toLngLatArray(geo.geometry?.coordinates, digit);
                    break;
                case "point":
                    lngLat = toLngLatArray(geo.coordinates, digit);
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!lngLat) {
            return null;
        } // null チェック追加
        try {
            return turf.point(lngLat)?.geometry;
        }
        catch {
            return null;
        }
    };
    /**
     * Converts an outer ring to Polygon GeoJSON (ring must be closed).
     * @param geo - [[lng,lat], ...] or Polygon-like GeoJSON
     * @param digit - Rounding digits
     * @returns Polygon or null
     * @example toPolygonGeoJson([
     *   [139.70,35.68],[139.78,35.68],[139.78,35.75],[139.70,35.75],[139.70,35.68]
     * ])
     * @category Geo Utilities
     */
    const toPolygonGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) { // [[外周リング]]
            ll = _.first(geo).map((coord) => toLngLatArray(coord, digit));
        }
        else if (_.arrayDepth(geo) === 2) { // [外周リング]
            ll = geo.map((coord) => toLngLatArray(coord, digit));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "polygon") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    // 最初のリング（外周）だけ取得
                    ll = _.first(_.first(geo.features)?.geometry.coordinates)
                        ?.map((coord) => toLngLatArray(coord, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "polygon") {
                        return null;
                    }
                    ll = _.first(geo.geometry.coordinates)?.map((coord) => toLngLatArray(coord, digit));
                    break;
                case "polygon":
                    ll = _.first(geo.coordinates)?.map((coord) => toLngLatArray(coord, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        if (!_.isEqual(_.first(ll), _.last(ll))) {
            return null;
        } // 閉じてるかチェック
        try {
            return turf.polygon([ll])?.geometry; // [ll] で囲む（外周リングの配列にする）
        }
        catch {
            return null;
        }
    };
    /**
     * Converts coordinate sequence to LineString GeoJSON; returns null if self-intersecting.
     * @param geo - [[lng,lat], ...] or LineString-like GeoJSON
     * @param digit - Rounding digits
     * @returns LineString or null
     * @example toLineStringGeoJson([[139.70,35.68],[139.75,35.70],[139.80,35.72]])
     * @category Geo Utilities
     */
    const toLineStringGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) {
            ll = _.first(geo).map((l) => toLngLatArray(l, digit));
        }
        else if (_.arrayDepth(geo) === 2) {
            ll = geo.map((l) => toLngLatArray(l, digit));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "linestring") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features)?.geometry.coordinates?.map((l) => toLngLatArray(l, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "linestring") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((l) => toLngLatArray(l, digit));
                    break;
                case "linestring":
                    ll = geo.coordinates?.map((l) => toLngLatArray(l, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        try {
            const feature = turf.lineString(ll); // Feature を取得
            if (!_.isEmpty(turf.kinks(feature)?.features)) {
                return null;
            } // 交差チェック
            return feature.geometry; // Geometry を返す
        }
        catch {
            return null;
        }
    };
    /**
     * Converts multiple points to MultiPoint GeoJSON.
     * @param geo - [[lng,lat], ...] or MultiPoint-like GeoJSON
     * @param digit - Rounding digits
     * @returns MultiPoint or null
     * @example toMultiPointGeoJson([[139.70,35.68],[139.71,35.69],[139.72,35.70]])
     * @category Geo Utilities
     */
    const toMultiPointGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 2) { // MultiPointは2次元
            ll = geo.map((coord) => toLngLatArray(coord, digit));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipoint") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates
                        ?.map((coord) => toLngLatArray(coord, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipoint") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((coord) => toLngLatArray(coord, digit));
                    break;
                case "multipoint":
                    ll = geo.coordinates?.map((coord) => toLngLatArray(coord, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        try {
            return turf.multiPoint(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    /**
     * Converts polygons (outer rings) to MultiPolygon GeoJSON.
     * @param geo - Polygons
     * @param digit - Rounding digits
     * @returns MultiPolygon or null
     * @example toMultiPolygonGeoJson([
     *   [[[139.7,35.6],[139.8,35.6],[139.8,35.7],[139.7,35.7],[139.7,35.6]]],
     *   [[[139.75,35.65],[139.85,35.65],[139.85,35.75],[139.75,35.75],[139.75,35.65]]]
     * ])
     * @category Geo Utilities
     */
    const toMultiPolygonGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 4) {
            ll = geo.map((polygon) => _.first(polygon).map((l) => toLngLatArray(l, digit)));
        }
        else if (_.has(geo, "type")) {
            switch (geo.type.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipolygon") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatArray(l, digit)));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipolygon") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatArray(l, digit)));
                    break;
                case "multipolygon":
                    ll = geo.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatArray(l, digit)));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find((polygon) => !polygon || polygon.find((ring) => !ring || ring.find(_.isEmpty)) || !_.isEqual(_.first(polygon), _.last(polygon)))) {
            return null;
        }
        try {
            return turf.multiPolygon(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    /**
    * Converts lines to MultiLineString GeoJSON, rejecting self-intersections.
    * @param geo - Lines
    * @param digit - Rounding digits
    * @returns MultiLineString or null
    * @example toMultiLineStringGeoJson([
    *   [[139.7,35.6],[139.8,35.65]],
    *   [[139.75,35.62],[139.85,35.68]]
    * ])
    * @category Geo Utilities
    */
    const toMultiLineStringGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3) {
            ll = geo.map((line) => line.map((l) => toLngLatArray(l, digit)));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type").toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multilinestring") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates?.map((line) => line.map((l) => toLngLatArray(l, digit)));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multilinestring") {
                        return null;
                    } // 修正
                    ll = geo.geometry?.coordinates?.map((line) => line.map((l) => toLngLatArray(l, digit)));
                    break;
                case "multilinestring":
                    ll = geo.coordinates?.map((line) => line.map((l) => toLngLatArray(l, digit)));
                    break;
                default:
                    return null;
            }
        }
        if (!ll || ll.find((g) => !g || g.find(_.isEmpty))) {
            return null;
        }
        try {
            // 一旦linestringでチェック
            if (ll.find((l) => {
                const r = turf.lineString(l);
                if (!r)
                    return true;
                const kinks = turf.kinks(r);
                return !_.isEmpty(kinks.features);
            })) {
                return null;
            }
            return turf.multiLineString(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    /**
     * Unions polygons into a single Polygon/MultiPolygon.
     * @param geo - Polygon/MultiPolygon/FeatureCollection, etc.
     * @param digit - Rounding digits
     * @returns Unified geometry or null
     * @example unionPolygon([
     *   [[139.7,35.6],[139.8,35.6],[139.8,35.7],[139.7,35.7],[139.7,35.6]],
     *   [[139.75,35.65],[139.85,35.65],[139.85,35.75],[139.75,35.75],[139.75,35.65]]
     * ])
     * @category Geo Utilities
     */
    const unionPolygon = (geo, digit) => {
        let list = null;
        const g = geo;
        if (_.arrayDepth(geo) === 4) {
            geo = _.first(geo);
        }
        if (Array.isArray(geo)) {
            list = geo.map(g => {
                const p = toPolygonGeoJson(g, digit);
                return p ? turf.polygon(p.coordinates) : null;
            }).filter(Boolean);
        }
        else if (_.has(geo, "type")) {
            switch (_.get(g, "type")?.toLowerCase()) {
                case "featurecollection":
                    list = g.features?.map((f) => {
                        const p = toPolygonGeoJson(f, digit);
                        return p ? turf.polygon(p.coordinates) : null;
                    }).filter(Boolean);
                    break;
                case "feature":
                    if (g.geometry?.type !== "polygon") {
                        return g;
                    }
                    else if (g.geometry?.type === "multipolygon") {
                        list = g.geometry?.coordinates.map((c) => {
                            const p = toPolygonGeoJson(c, digit);
                            return p ? turf.polygon(p.coordinates) : null;
                        }).filter(Boolean);
                    }
                    break;
                case "polygon":
                    return g;
                case "multipolygon":
                    list = g.coordinates.map((c) => {
                        const p = toPolygonGeoJson(c, digit);
                        return p ? turf.polygon(p.coordinates) : null;
                    }).filter(Boolean);
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (_.isEmpty(list)) {
            return null;
        }
        if (_.size(list) === 1) {
            return _.first(list).geometry;
        }
        return turf.union(turf.featureCollection(list))?.geometry ?? null;
    };
    /**
     * Converts input to GeoJSON geometry of the given type. `auto` tries higher dimensions first.
     * @param geo - Input
     * @param type - GeomType
     * @param digit - Rounding digits
     * @returns Geometry or null
     * @example toGeoJson([139.7,35.6], GeomType.point)
     * @example toGeoJson([[139.7,35.6],[139.8,35.7]], GeomType.lineString)
     * @example toGeoJson(
     *   [[[139.7,35.6],[139.8,35.6],[139.8,35.7],[139.7,35.7],[139.7,35.6]]],
     *   GeomType.polygon
     * )
     * @category Geo Utilities
     */
    const toGeoJson = (geo, type = GeomType.auto, digit) => {
        if (_.isEmpty(geo)) {
            return null;
        }
        if (typeof geo === "string") {
            geo = _.parseJSON(geo);
        }
        switch (type) {
            case GeomType.point:
                return toPointGeoJson(geo, digit);
            case GeomType.polygon:
                return toPolygonGeoJson(geo, digit);
            case GeomType.lineString:
                return toLineStringGeoJson(geo, digit);
            case GeomType.multiLineString:
                return toMultiLineStringGeoJson(geo, digit);
            case GeomType.multiPoint:
                return toMultiPointGeoJson(geo, digit);
            case GeomType.multiPolygon:
                return toMultiPolygonGeoJson(geo, digit);
            default:
                break;
        }
        // auto: 次元の高い順に試す
        return toMultiPolygonGeoJson(geo, digit)
            ?? toMultiLineStringGeoJson(geo, digit)
            ?? toPolygonGeoJson(geo, digit)
            ?? toLineStringGeoJson(geo, digit)
            ?? toMultiPointGeoJson(geo, digit)
            ?? toPointGeoJson(geo, digit);
    };
    /**
     * Converts inputs into a list of GeoJSON.Features suitable for TerraDraw.
     * Multi-geometries are exploded into individual features and assigned UUIDs.
     * @param geo - Geometry/Feature/FeatureCollection or nested arrays
     * @returns Feature array (may be empty when input is invalid)
     */
    const parseToTerraDraw = (geo) => {
        let feature = toGeoJson(geo, GeomType.auto);
        if (_.isEmpty(feature) && Array.isArray(geo)) {
            return geo.flatMap(parseToTerraDraw);
        }
        if (!feature)
            return [];
        const features = [];
        const geom = feature.geometry; // 一度だけ
        switch (geom.type) {
            case "MultiPoint":
                geom.coordinates.forEach((coord) => {
                    const f = turf.point(coord, { mode: "point" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            case "MultiLineString":
                geom.coordinates.forEach((coords) => {
                    const f = turf.lineString(coords, { mode: "linestring" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            case "MultiPolygon":
                geom.coordinates.forEach((coords) => {
                    const f = turf.polygon(coords, { mode: "polygon" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            default:
                const f = { ...feature };
                f.id = crypto.randomUUID();
                f.properties = {
                    ...f.properties,
                    mode: geom.type.toLowerCase()
                };
                features.push(f);
        }
        return features;
    };
    /**
     * Creates a MapBox zoom interpolation expression from a simple object mapping.
     * Converts `{10: 1, 15: 5, 20: 10}` into MapBox's interpolation array format.
     *
     * @param zoomValues - Object mapping zoom levels to values
     * @param type - Interpolation type: "linear", "exponential", or "cubic-bezier" (default: "linear")
     * @returns MapBox interpolation expression array
     * @example
     * _.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
     * // Returns: ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]
     * @example
     * _.mZoomInterpolate({ 12: 0.5, 18: 2 }, "exponential")
     * @category Geo Utilities
     */
    const mZoomInterpolate = (zoomValues, type = "linear") => {
        let vals = [];
        Object.entries(zoomValues).sort((v1, v2) => {
            return parseFloat(v1[0]) - parseFloat(v2[0]);
        }).map(([zoom, val]) => {
            vals.push(parseFloat(zoom));
            vals.push(val);
        });
        return [
            "interpolate",
            [type],
            ["zoom"],
            ...vals,
        ];
    };
    /**
     * Converts camelCase properties to MapBox-compatible format.
     * Handles special cases like minzoom, maxzoom, tileSize, cluster properties, and converts
     * visibility boolean to "visible"/"none". Recursively processes nested objects and arrays.
     *
     * @param properties - Object with camelCase properties
     * @param excludeKeys - Keys to exclude from conversion (keeps original key and value)
     * @returns Converted properties object compatible with MapBox
     * @example
     * _.mProps({
     *   fillColor: "#ff0000",
     *   fillOpacity: 0.5,
     *   sourceLayer: "buildings"
     * })
     * // Returns: { "fill-color": "#ff0000", "fill-opacity": 0.5, "source-layer": "buildings" }
     * @example
     * _.mProps({ visibility: true }) // Returns: { visibility: "visible" }
     * @example
     * _.mProps({ minZoom: 10, maxZoom: 20 }) // Returns: { minzoom: 10, maxzoom: 20 }
     * @category Geo Utilities
     */
    const mProps = (properties, excludeKeys = []) => {
        if (_.isEmpty(properties)) {
            return properties;
        }
        if (Array.isArray(properties)) {
            return properties.map(p => mProps(p, excludeKeys));
        }
        if (typeof properties === "object") {
            return Object.fromEntries(Object.entries(properties).map(([key, value]) => {
                let newKey = key;
                const lKey = key.toLowerCase();
                if (lKey === "minzoom") {
                    newKey = "minzoom";
                }
                else if (lKey === "maxzoom") {
                    newKey = "maxzoom";
                }
                else if (lKey === "tilesize") {
                    newKey = "tileSize";
                }
                else if (lKey === "clusterradius") {
                    newKey = "clusterRadius";
                }
                else if (lKey === "clustermaxzoom") {
                    newKey = "clusterMaxZoom";
                }
                else if (lKey === "clusterminpoints") {
                    newKey = "clusterMinPoints";
                }
                else if (lKey === "clusterproperties") {
                    newKey = "clusterProperties";
                }
                else if (lKey === "linemetrics") {
                    newKey = "lineMetrics";
                }
                else {
                    newKey = _.kebabCase(newKey).toLowerCase();
                }
                if (key === "visibility" && _.isBoolean(value)) {
                    return ["visibility", value ? "visible" : "none"];
                }
                if (excludeKeys.includes(key) || excludeKeys.includes(newKey)) {
                    return [key, value];
                }
                if (Array.isArray(value) || typeof value === "object") {
                    value = mProps(value, excludeKeys);
                }
                return [newKey, value];
            }));
        }
        return properties;
    };
    const a = _;
    a.toLngLatArray = toLngLatArray;
    a.toGeoJson = toGeoJson;
    a.toPointGeoJson = toPointGeoJson;
    a.toPolygonGeoJson = toPolygonGeoJson;
    a.toLineStringGeoJson = toLineStringGeoJson;
    a.toMultiPointGeoJson = toMultiPointGeoJson;
    a.toMultiLineStringGeoJson = toMultiLineStringGeoJson;
    a.toMultiPolygonGeoJson = toMultiPolygonGeoJson;
    a.unionPolygon = unionPolygon;
    a.parseToTerraDraw = parseToTerraDraw;
    a.mZoomInterpolate = mZoomInterpolate;
    a.mProps = mProps;
}
