import GeoJSON, { Geometry } from "geojson";
/**
 * Geometry type selector for conversions. Use `auto` to try higher dimensions first.
 */
export declare enum GeomType {
    point = 0,
    polygon = 1,
    lineString = 2,
    multiPoint = 3,
    multiPolygon = 4,
    multiLineString = 5,
    auto = "auto"
}
/**
 * Converts a coordinate-like value to a [lng, lat] tuple, optionally rounding digits.
 * Swaps order if lat/lng appear to be inverted. Returns null when invalid.
 * @internal
 */
declare const toLngLatArray: (coord: any, digit?: number) => [lng: number, lat: number] | null;
/**
 * Converts coordinates or an object to a Point GeoJSON.
 * @param geo - [lng,lat] or {lat,lng}
 * @param digit - Rounding digits
 * @returns Point or null
 * @example toPointGeoJson([139.7671,35.6812])
 * @example toPointGeoJson({ lat:35.6895, lng:139.6917 })
 * @category Geo Utilities
 */
declare const toPointGeoJson: (geo: any, digit?: number) => GeoJSON.Point | null;
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
declare const toPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.Polygon | null;
/**
 * Converts coordinate sequence to LineString GeoJSON; returns null if self-intersecting.
 * @param geo - [[lng,lat], ...] or LineString-like GeoJSON
 * @param digit - Rounding digits
 * @returns LineString or null
 * @example toLineStringGeoJson([[139.70,35.68],[139.75,35.70],[139.80,35.72]])
 * @category Geo Utilities
 */
declare const toLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.LineString | null;
/**
 * Converts multiple points to MultiPoint GeoJSON.
 * @param geo - [[lng,lat], ...] or MultiPoint-like GeoJSON
 * @param digit - Rounding digits
 * @returns MultiPoint or null
 * @example toMultiPointGeoJson([[139.70,35.68],[139.71,35.69],[139.72,35.70]])
 * @category Geo Utilities
 */
declare const toMultiPointGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPoint | null;
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
declare const toMultiPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPolygon | null;
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
declare const toMultiLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.MultiLineString | null;
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
declare const unionPolygon: (geo: any, digit?: number) => GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
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
declare const toGeoJson: (geo: any, type?: GeomType, digit?: number) => Geometry | null;
/**
 * Converts inputs into a list of GeoJSON.Features suitable for TerraDraw.
 * Multi-geometries are exploded into individual features and assigned UUIDs.
 * @param geo - Geometry/Feature/FeatureCollection or nested arrays
 * @returns Feature array (may be empty when input is invalid)
 */
declare const parseToTerraDraw: (geo: any) => GeoJSON.Feature[];
/**
 * Creates a MapBox zoom interpolation expression from a simple object mapping.
 * Converts `{10: 1, 15: 5, 20: 10}` into MapBox's interpolation array format.
 *
 * @param zoomValues - Object mapping zoom levels to values
 * @param type - Interpolation type: "linear", "exponential", or "cubic-bezier" (default: "linear")
 * @returns MapBox interpolation expression array
 * @example
 * mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
 * // Returns: ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]
 * @example
 * mZoomInterpolate({ 12: 0.5, 18: 2 }, "exponential")
 * @category Geo Utilities
 */
declare const mZoomInterpolate: (zoomValues: Record<number, number>, type?: string) => (string | number | string[])[];
/**
 * Converts camelCase properties to MapBox-compatible format.
 * Handles special cases like minzoom, maxzoom, tileSize, cluster properties, and converts
 * visibility boolean to "visible"/"none". Recursively processes nested objects and arrays.
 *
 * @param properties - Object with camelCase properties
 * @param excludeKeys - Keys to exclude from conversion (keeps original key and value)
 * @returns Converted properties object compatible with MapBox
 * @example
 * mProps({
 *   fillColor: "#ff0000",
 *   fillOpacity: 0.5,
 *   sourceLayer: "buildings"
 * })
 * // Returns: { "fill-color": "#ff0000", "fill-opacity": 0.5, "source-layer": "buildings" }
 * @example
 * mProps({ visibility: true }) // Returns: { visibility: "visible" }
 * @example
 * mProps({ minZoom: 10, maxZoom: 20 }) // Returns: { minzoom: 10, maxzoom: 20 }
 * @category Geo Utilities
 */
declare const mProps: (properties: Record<string, any>, excludeKeys?: string[]) => any;
export { toLngLatArray, toGeoJson, toPointGeoJson, toPolygonGeoJson, toLineStringGeoJson, toMultiPointGeoJson, toMultiLineStringGeoJson, toMultiPolygonGeoJson, unionPolygon, parseToTerraDraw, mZoomInterpolate, mProps, };
