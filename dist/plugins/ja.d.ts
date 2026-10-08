import { toHalfWidth as utilToHalfWidth, haifun } from "../util.js";
/**
 * ja プラグインが eskamasu に追加するメソッド群。
 *
 * このインターフェースは下記の `declare module` ブロックで `EskamasuType` に merge され、
 * `import "eskamasu/plugins/ja"` するだけで `_` の型が自動的に拡張される。
 */
export interface EskamasuJaExtension {
    kanaToFull: (str: unknown) => string | null;
    kanaToHalf: (str: unknown) => string | null;
    kanaToHira: (str: unknown) => string | null;
    hiraToKana: (str: unknown) => string | null;
    toHalfWidth: typeof utilToHalfWidth;
    toFullWidth: (value: unknown, withHaifun?: string) => string | null;
    haifun: typeof haifun;
}
declare module "../index.js" {
    interface EskamasuType extends EskamasuJaExtension {
    }
}
export {};
