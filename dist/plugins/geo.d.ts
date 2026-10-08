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
 * geo プラグインが eskamasu に追加するメソッド群。
 *
 * このインターフェースは下記の `declare module` ブロックで `EskamasuType` に merge され、
 * `import "eskamasu/plugins/geo"` するだけで `_` の型が自動的に拡張される。
 */
export interface EskamasuGeoPluginExtension {
    toLngLatArray: (coord: any, digit?: number) => [lng: number, lat: number] | null;
    toGeoJson: (geo: any, type?: GeomType, digit?: number) => Geometry | null;
    toPointGeoJson: (geo: any, digit?: number) => GeoJSON.Point | null;
    toPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.Polygon | null;
    toLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.LineString | null;
    toMultiPointGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPoint | null;
    toMultiPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPolygon | null;
    toMultiLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.MultiLineString | null;
    unionPolygon: (geo: any, digit?: number) => GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
    parseToTerraDraw: (geo: any) => GeoJSON.Feature[];
    mZoomInterpolate: (zoomValues: Record<number, number>, type?: string) => any;
    mProps: (properties: Record<string, any>, excludeKeys?: string[]) => Record<string, any>;
}
declare module "../index.js" {
    interface EskamasuType extends EskamasuGeoPluginExtension {
    }
}
export {};
