import * as _ from "es-toolkit/compat"

// Escape special characters inside character classes: ] - \ ^
const escapeForCharClass = (s: string) => s.replace(/[\]\-\\^]/g, '\\$&')

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
export const haifun = (text?: string, replacement: string = "‐", expandInterpretation = false): string | null => {
    const base = [
        "\u002D", // - (HYPHEN-MINUS: ASCII hyphen/minus)
        "\u02D7", // ˗ (MODIFIER LETTER MINUS SIGN)
        "\u1173", // ᅳ (HANGUL JUNGSEONG EU)
        "\u1B78", // ᭸ (BALINESE LETTER U)
        "\u2010", // ‐ (HYPHEN)
        "\u2011", // ‑ (NON-BREAKING HYPHEN)
        "\u2012", // ‒ (FIGURE DASH)
        "\u2013", // – (EN DASH)
        "\u2014", // — (EM DASH)
        "\u2015", // ― (HORIZONTAL BAR)
        "\u2043", // ⁃ (HYPHEN BULLET)
        "\u207B", // ⁻ (SUPERSCRIPT MINUS)
        "\u2212", // − (MINUS SIGN)
        "\u25AC", // ▬ (BLACK RECTANGLE)
        "\u2500", // ─ (BOX DRAWINGS LIGHT HORIZONTAL)
        "\u2501", // ━ (BOX DRAWINGS HEAVY HORIZONTAL)
        "\u2574", // ╴ (BOX DRAWINGS LIGHT LEFT)
        "\u2576", // ╶ (BOX DRAWINGS LIGHT RIGHT)
        "\u257C", // ╼ (BOX DRAWINGS LIGHT LEFT AND HEAVY RIGHT)
        "\u257A", // ╺ (BOX DRAWINGS HEAVY LEFT AND LIGHT RIGHT)
        "\u257E", // ╾ (BOX DRAWINGS HEAVY LEFT)
        "\u2796", // ➖ (HEAVY MINUS SIGN)
        "\u2F00", // ⼀ (KANGXI RADICAL ONE)
        "\u30FC", // ー (KATAKANA-HIRAGANA PROLONGED SOUND MARK)
        "\u3127", // ㄧ (BOPOMOFO LETTER I)
        "\u3161", // ㅡ (HANGUL LETTER EU)
        "\u3192", // ㆒ (IDEOGRAPHIC ANNOTATION ONE MARK)
        "\u31D0", // ㇐ (CJK STROKE H)
        "\u4E00", // 一 (CJK UNIFIED IDEOGRAPH-4E00)
        "\u4EA0", // 亠 (CJK UNIFIED IDEOGRAPH-4EA0)
        "\uFE58", // ﹘ (SMALL EM DASH)
        "\uFE63", // ﹣ (SMALL HYPHEN-MINUS)
        "\uFF0D", // − (FULL WIDTH HYPHEN-MINUS)
        "\uFF70", // ｰ (HALF WIDTH PROLONGED SOUND MARK)
        "\uFFDA", // ￚ (HALFWIDTH HANGUL LETTER EU)
        "\u{10110}", // 𐄐 (AEGEAN NUMBER TEN)
        "\u{10191}", // 𐆑 (ROMAN UNCIA SIGN)
        "\u1680", // (OGHAM SPACE MARK)
    ]

    const ex = [
        "\u2192", // → (RIGHTWARDS ARROW)
        "\u2504", // ┄ (BOX DRAWINGS LIGHT TRIPLE DASH HORIZONTAL)
        "\u2505", // ┅ (BOX DRAWINGS HEAVY TRIPLE DASH HORIZONTAL)
        "\u2508", // ┈ (BOX DRAWINGS LIGHT QUADRUPLE DASH HORIZONTAL)
        "\u2509", // ┉ (BOX DRAWINGS HEAVY QUADRUPLE DASH HORIZONTAL)
        "\u254C", // ╌ (BOX DRAWINGS LIGHT DOUBLE DASH HORIZONTAL)
        "\u254D", // ╍ (BOX DRAWINGS HEAVY DOUBLE DASH HORIZONTAL)
        "\u301C", // 〜 (WAVE DASH)
        "\u007E", // ~ (TILDE)
        "\u005F", // _ (LOW LINE)
        "\uFF3F", // ＿ (FULLWIDTH LOW LINE)
        "\uFE4E", // ﹎ (CENTRELINE LOW LINE)
        "\uFFE3", // ￣ (FULLWIDTH MACRON)
        "\u02C9", // ˉ (MODIFIER LETTER MACRON)
    ]


    const baseClass = base.map(escapeForCharClass).join("")
    const exClass = ex.map(escapeForCharClass).join("")

    const res = text?.replace(new RegExp(`[${baseClass}]`, "gu"), replacement)
    return (expandInterpretation ? res?.replace(new RegExp(`[${exClass}]`, "gu"), replacement) ?? undefined : res) ?? null
}

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
export const toHalfWidth = (value: unknown, withHaifun?: string): string | null => {
    if (_.isNil(value)) { return null }
    const str = String(value).split('').map(char => {
        const code = char.charCodeAt(0)
        // スペース
        if (code === 0x3000) {
            return '\u0020'  // 全角スペース
        }
        // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
        if (code >= 0xFF01 && code <= 0xFF5E) {
            return String.fromCharCode(code - 0xFEE0)
        }
        return char
    }).join('')
    return withHaifun ? haifun(str, withHaifun) : str
}