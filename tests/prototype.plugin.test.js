import '../dist/index.js'
import '../dist/plugins/prototype.js'
import { describe, it, expect } from 'vitest'

describe('Prototype Plugin', () => {
  it('notMap', () => {
    const r = [1,2,3].notMap(n => n > 1)
    expect(r).toEqual([true, false, false])
  })

  it('notFilter', () => {
    const r = [1,2,3,4,5].notFilter(n => n % 2 === 0)
    expect(r).toEqual([1,3,5])
  })
})
