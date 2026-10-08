/**
 * Normalizes many hyphen/dash/horizontal-line code points into a single character.
 * @param text - Text to normalize
 * @param replacement - Replacement character (default "‐")
 * @param expandInterpretation - Also normalize tildes/underscores and related marks
 * @returns Normalized text or null
 * @example haifun('TokyoーOsaka—Nagoya') // 'Tokyo‐Osaka‐Nagoya'
 * @example haifun('file_name〜test','‐',true) // 'file‐name‐test'
 * @example haifun('ABC—123−XYZ','-') // 'ABC-123-XYZ'
 * @category String Utilities
 */
export declare const haifun: (text?: string, replacement?: string, expandInterpretation?: boolean) => string | null;
/**
 * Converts full-width characters to half-width; optionally normalizes hyphens.
 * @param value - Value to convert
 * @param withHaifun - Hyphen replacement character
 * @returns Half-width string or null
 * @example toHalfWidth('ＡＢＣ１２３') // 'ABC123'
 * @example toHalfWidth('東京都千代田区１ー２ー３','-') // '東京都千代田区1-2-3'
 * @example toHalfWidth('ＡＢＣ １２３') // 'ABC 123'
 * @category String Utilities
 */
export declare const toHalfWidth: (value: unknown, withHaifun?: string) => string | null;
