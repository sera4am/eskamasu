import { haifun } from "../util.js";
/**
 * Converts half-width katakana to full-width.
 * @param str - String
 * @returns Full-width katakana or null
 * @example kanaToFull('ｶﾞｷﾞ') // 'ガギ'
 * @category Japanese Utilities
 */
declare const kanaToFull: (str: unknown) => string | null;
/**
 * Converts full-width katakana to half-width (dakuten may split into two characters).
 * @param str - String
 * @returns Half-width katakana or null
 * @example kanaToHalf('ガギ') // 'ｶﾞｷﾞ'
 * @category Japanese Utilities
 */
declare const kanaToHalf: (str: unknown) => string | null;
/**
 * Converts katakana to hiragana; half-width input is converted to full-width first.
 * @param str - String
 * @returns Hiragana or null
 * @example kanaToHira('アイウ') // 'あいう'
 * @category Japanese Utilities
 */
declare const kanaToHira: (str: unknown) => string | null;
/**
 * Converts hiragana to katakana.
 * @param str - String
 * @returns Katakana or null
 * @example hiraToKana('あいう') // 'アイウ'
 * @category Japanese Utilities
 */
declare const hiraToKana: (str: unknown) => string | null;
/**
 * Converts half-width characters to full-width; optionally normalizes hyphens.
 * @param value - Value to convert
 * @param withHaifun - Hyphen replacement character
 * @returns Full-width string or null
 * @example toFullWidth('ABC-123','ー') // 'ＡＢＣー１２３'
 * @category Japanese Utilities
 */
declare const toFullWidth: (value: unknown, withHaifun?: string) => string | null;
/**
 * Converts to half-width and optionally normalizes hyphens.
 * @param value - Value to convert
 * @param withHaifun - Hyphen replacement character
 * @returns Half-width string or null
 * @example toHalfWidth('ＡＢＣー１２３','-') // 'ABC-123'
 * @example toHalfWidth(' ｱｲｳ 123 ') // ' ｱｲｳ 123 '
 * @category Japanese Utilities
 */
declare const toHalfWidth: (value: unknown, withHaifun?: string) => string | null;
export { kanaToFull, kanaToHalf, kanaToHira, hiraToKana, toHalfWidth, toFullWidth, haifun, };
