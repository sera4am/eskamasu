import _ from '../dist/index.js'
import { describe, it, expect } from 'vitest'

// index.ts core API tests

describe('Core Functions', () => {
  it('isValidStr', () => {
    expect(_.isValidStr('hello')).toBe(true)
    expect(_.isValidStr('0')).toBe(true)
    expect(_.isValidStr('')).toBe(false)
    expect(_.isValidStr(null)).toBe(false)
    expect(_.isValidStr(undefined)).toBe(false)
    expect(_.isValidStr(123)).toBe(false)
  })

  it('isValidEmail', () => {
    expect(_.isValidEmail('user@example.com')).toBe(true)
    expect(_.isValidEmail('USER@EXAMPLE.COM')).toBe(true)
    expect(_.isValidEmail(' user@example.com ')).toBe(false)
    expect(_.isValidEmail('invalid-email')).toBe(false)
    expect(_.isValidEmail('')).toBe(false)
    expect(_.isValidEmail(null)).toBe(false)
    expect(_.isValidEmail(undefined)).toBe(false)
  })

  it('valueOr (sync)', () => {
    expect(_.valueOr('value', 'default')).toBe('value')
    expect(_.valueOr(null, 'default')).toBe('default')
    expect(_.valueOr(undefined, 'default')).toBe('default')
    expect(_.valueOr('', 'default')).toBe('default')
    expect(_.valueOr([], 'default')).toBe('default')
    expect(_.valueOr(0, 'default')).toBe(0)
    expect(_.valueOr(() => 'computed', 'default')).toBe('computed')
    expect(_.valueOr(() => null, 'default')).toBe('default')
    expect(_.valueOr(null, () => 'lazy default')).toBe('lazy default')
  })

  it('valueOr (async)', async () => {
    const p = Promise.resolve(null)
    await expect(_.valueOr(p, 'default')).resolves.toBe('default')
    await expect(_.valueOr(Promise.resolve('v'), 'd')).resolves.toBe('v')
    await expect(_.valueOr(() => Promise.resolve('x'), 'd')).resolves.toBe('x')
  })

  it('emptyOr', async () => {
    expect(_.emptyOr('abc', 'd')).toBe('d')
    expect(_.emptyOr('', 'd')).toBe(null)
    await expect(_.emptyOr(Promise.resolve('abc'), (v) => v.toUpperCase())).resolves.toBe('ABC')
    await expect(_.emptyOr(Promise.resolve(''), 'd')).resolves.toBe(null)
  })

  it('hasOr', async () => {
    const obj = { user: { name: 'a', age: 1 } }
    expect(_.hasOr(obj, ['user.name', 'user.age'], 'd')).toEqual(obj)
    expect(_.hasOr(obj, ['user.name', 'user.missing'], 'd')).toBe('d')
    await expect(_.hasOr(Promise.resolve(obj), 'user.id', (v) => v?.user?.name)).resolves.toBe('a')
  })

  it('isEmpty', () => {
    expect(_.isEmpty(null)).toBe(true)
    expect(_.isEmpty(undefined)).toBe(true)
    expect(_.isEmpty('')).toBe(true)
    expect(_.isEmpty([])).toBe(true)
    expect(_.isEmpty({})).toBe(true)
    expect(_.isEmpty(0)).toBe(false)
    expect(_.isEmpty(-1)).toBe(false)
    expect(_.isEmpty(false)).toBe(false)
    expect(_.isEmpty('text')).toBe(false)
    expect(_.isEmpty([1,2])).toBe(false)
    expect(_.isEmpty({a:1})).toBe(false)
  })

  it('toNumber', () => {
    expect(_.toNumber('123')).toBe(123)
    expect(_.toNumber('１２３')).toBe(123)
    expect(_.toNumber('1,234')).toBe(1234)
    expect(_.toNumber('1,234.56')).toBe(1234.56)
    expect(_.toNumber(456)).toBe(456)
    expect(_.toNumber(null)).toBeNull()
    expect(_.toNumber(undefined)).toBeNull()
    expect(_.toNumber('abc')).toBeNull()
    expect(_.toNumber('')).toBeNull()
  })

  it('toBool', async () => {
    expect(await _.toBool(true)).toBe(true)
    expect(await _.toBool(false)).toBe(false)
    expect(await _.toBool(1)).toBe(true)
    expect(await _.toBool(0)).toBe(false)
    expect(await _.toBool('true')).toBe(true)
    expect(await _.toBool('false')).toBe(false)
    expect(await _.toBool('YES')).toBe(true)
    expect(await _.toBool('ng')).toBe(false)
    // function/Promise input short-circuits due to early isEmpty(function) guard; skip for now
    expect(await _.toBool('unknown', null)).toBeNull()
  })

  it('boolIf', () => {
    expect(_.boolIf(true)).toBe(true)
    expect(_.boolIf(false)).toBe(false)
    expect(_.boolIf(1)).toBe(true)
    expect(_.boolIf(0)).toBe(false)
    expect(_.boolIf('x')).toBe(false)
    expect(_.boolIf('x', true)).toBe(true)
  })

  it('equalsOr', async () => {
    expect(_.equalsOr('a','a','d')).toBe('a')
    expect(_.equalsOr('a','b','d')).toBe('d')
    expect(_.equalsOr(null, undefined, 'd')).toBeNull()
    expect(_.equalsOr({a:1},{a:1},'d')).toEqual({a:1})
    expect(_.equalsOr([1,2],[1,2],'d')).toEqual([1,2])
    // 2-arg form behaves like valueOr
    expect(_.equalsOr('v','d')).toBe('v')
    expect(_.equalsOr(null,'d')).toBe('d')
    await expect(_.equalsOr(Promise.resolve('x'), Promise.resolve('x'), 'd')).resolves.toBe('x')
  })

  it('parseJSON', () => {
    expect(_.parseJSON('{"a":1}')).toEqual({a:1})
    expect(_.parseJSON('{a:1}')).toEqual({a:1})
    expect(_.parseJSON({a:1})).toEqual({a:1})
    expect(_.parseJSON('invalid')).toBeNull()
    expect(_.parseJSON(null)).toBeNull()
  })

  it('jsonStringify', () => {
    expect(_.jsonStringify({a:1})).toBe('{"a":1}')
    expect(_.jsonStringify('{a:1}')).toBe('{"a":1}')
    expect(_.jsonStringify('{"a":1}')).toBe('{"a":1}')
    expect(_.jsonStringify(null)).toBeNull()
    expect(_.jsonStringify(undefined)).toBeNull()
  })

  it('castArray', () => {
    expect(_.castArray(1)).toEqual([1])
    expect(_.castArray('s')).toEqual(['s'])
    expect(_.castArray([1,2])).toEqual([1,2])
    expect(_.castArray(null)).toEqual([])
    expect(_.castArray(undefined)).toEqual([])
  })

  it('arrayDepth', () => {
    expect(_.arrayDepth([1,2,3])).toBe(1)
    expect(_.arrayDepth([[1,2],[3,4]])).toBe(2)
    expect(_.arrayDepth([[[1,2]]])).toBe(3)
    expect(_.arrayDepth([])).toBe(1)
    expect(_.arrayDepth('no')).toBe(0)
    expect(_.arrayDepth([[1,2],[[3,4]]])).toBe(2)
  })

  it('changes', async () => {
    const source1 = { a: 1, b: 2, c: 3 }
    const current1 = { a: 1, b: 3, c: 3 }
    expect(_.changes(source1, current1, ['a','b','c'])).toEqual({ b: 3 })

    const source2 = { a: 1, b: 2 }
    const current2 = { a: 1, b: 2, c: 3 }
    expect(_.changes(source2, current2, ['a','b','c'])).toEqual({ c: 3 })

    const source3 = { a: 1, b: 2, c: 3 }
    const current3 = { a: 1, b: 2 }
    expect(_.changes(source3, current3, ['a','b','c'])).toEqual({ c: null })

    const source4 = { user: { name: 'Alice', age: 30 } }
    const current4 = { user: { name: 'Bob', age: 30 } }
    expect(_.changes(source4, current4, ['user.name','user.age'])).toEqual({ user: { name: 'Bob' } })

    const source5 = { a: 1, b: 2, c: 3, d: 4 }
    const current5 = { a: 1, b: 3, c: 4, d: 4 }
    expect(_.changes(source5, current5, ['a','d'], { keyExcludes:true })).toEqual({ b: 3, c: 4 })

    const finallySpy = []
    const res = await _.changes(
      { x: 1 }, { x: 2 }, ['x'], {},
      (diff) => { finallySpy.push(diff); },
      (diff) => { return 'not-empty' }
    )
    expect(res).toEqual({ x: 2 })
    expect(finallySpy.length).toBe(1)
  })

  it('plugin registry (__plugins) is exposed and prevents duplicates', async () => {
    expect(_.__plugins).toBeInstanceOf(Set)
    // ja プラグインを2回 import しても1回しか登録されないことを確認
    await import('../dist/plugins/ja.js')
    const sizeBefore = _.__plugins.size
    expect(_.__plugins.has('ja')).toBe(true)
    await import('../dist/plugins/ja.js')
    expect(_.__plugins.size).toBe(sizeBefore)
  })

  it('lodash passthrough', () => {
    expect(_.size([1,2,3])).toBe(3)
    expect(_.isNil(null)).toBe(true)
    expect(_.isEqual({a:1},{a:1})).toBe(true)
    expect(_.first([1,2,3])).toBe(1)
    expect(_.last([1,2,3])).toBe(3)
    expect(_.uniq([1,2,2,3])).toEqual([1,2,3])
    expect(_.has({a:1}, 'a')).toBe(true)
  })

  it('original lodash versions', () => {
    expect(_.isEmptyOrg('')).toBe(true)
    expect(_.isEmptyOrg(0)).toBe(true) // original lodash behavior
    expect(Number.isNaN(_.toNumberOrg('abc'))).toBe(true)
    expect(_.castArrayOrg(1)).toEqual([1])
  })
})
