import _ from '../dist/index.js'
import '../dist/plugins/ja.js'
import { describe, it, expect } from 'vitest'

const eskamasu = _

describe('JA Plugin', () => {
  it('kanaToFull', () => {
    expect(eskamasu.kanaToFull('ｶﾞｷﾞ')).toBe('ガギ')
    expect(eskamasu.kanaToFull('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ')).toBe('パピプペポ')
    expect(eskamasu.kanaToFull(123)).toBeNull()
  })

  it('kanaToHalf', () => {
    expect(eskamasu.kanaToHalf('ガギ')).toBe('ｶﾞｷﾞ')
    expect(eskamasu.kanaToHalf('アイウ')).toBe('ｱｲｳ')
    expect(eskamasu.kanaToHalf(null)).toBeNull()
  })

  it('kanaToHira / hiraToKana', () => {
    expect(eskamasu.kanaToHira('アイウ')).toBe('あいう')
    expect(eskamasu.hiraToKana('あいう')).toBe('アイウ')
  })

  it('toHalfWidth (with haifun)', () => {
    // hyphen normalization
    expect(eskamasu.toHalfWidth('ABCーDEF','-')).toBe('ABC-DEF')
    // full-width to half-width
    expect(eskamasu.toHalfWidth('ＡＢＣ１２３')).toBe('ABC123')
    // spaces
    expect(eskamasu.toHalfWidth(' ｱｲｳ　123 ')).toBe(' ｱｲｳ 123 ')
  })

  it('toFullWidth (with haifun)', () => {
    expect(eskamasu.toFullWidth('ABC-123','ー')).toBe('ＡＢＣー１２３')
    expect(eskamasu.toFullWidth(' ｱｲｳ 123 ')).toBe('　アイウ　１２３　')
  })

  it('haifun normalization', () => {
    expect(eskamasu.haifun('東京ー大阪—名古屋')).toBe('東京‐大阪‐名古屋')
    expect(eskamasu.haifun('file_name〜test','‐',true)).toBe('file‐name‐test')
  })

  it('haifun keeps ASCII digits (astral code points must not split into BMP + digit)', () => {
    expect(eskamasu.haifun('8‐1 10−0', '-')).toBe('8-1 10-0')
    expect(eskamasu.toHalfWidth('西新宿二丁目８－１', '-')).toBe('西新宿二丁目8-1')
    expect(eskamasu.haifun('\u{10110}\u{10191}', '-')).toBe('--')
  })
})
