import * as _ from '../dist/plugins/geo.js'
import { describe, it, expect } from 'vitest'

const eskamasu = _

describe('Geo Plugin', () => {
  it('toPointGeoJson', () => {
    expect(eskamasu.toPointGeoJson([139.7,35.6])).toEqual({ type: 'Point', coordinates: [139.7,35.6] })
    expect(eskamasu.toPointGeoJson({ lng:139.7, lat:35.6 })).toEqual({ type: 'Point', coordinates: [139.7,35.6] })
    expect(eskamasu.toPointGeoJson(null)).toBeNull()
  })

  it('toPolygonGeoJson (simple outer ring)', () => {
    const ring = [[139.7,35.6],[139.8,35.6],[139.8,35.7],[139.7,35.7],[139.7,35.6]]
    const poly = eskamasu.toPolygonGeoJson(ring)
    expect(poly?.type).toBe('Polygon')
    expect(poly?.coordinates?.[0]?.length).toBe(5)
  })

  it('toLineStringGeoJson', () => {
    const line = [[139.7,35.6],[139.75,35.7],[139.8,35.72]]
    const ls = eskamasu.toLineStringGeoJson(line)
    expect(ls?.type).toBe('LineString')
    expect(ls?.coordinates?.length).toBe(3)
  })

  it('toMultiPoint / toMultiLineString / toMultiPolygon', () => {
    const mp = eskamasu.toMultiPointGeoJson([[139.7,35.6],[139.71,35.61]])
    expect(mp?.type).toBe('MultiPoint')
    expect(mp?.coordinates.length).toBe(2)

    const mls = eskamasu.toMultiLineStringGeoJson([
      [[139.7,35.6],[139.71,35.61]],
      [[139.72,35.62],[139.73,35.63]],
    ])
    expect(mls?.type).toBe('MultiLineString')
    expect(mls?.coordinates.length).toBe(2)

    const mp2 = eskamasu.toMultiPolygonGeoJson([
      [[[139.7,35.6],[139.8,35.6],[139.8,35.7],[139.7,35.7],[139.7,35.6]]],
      [[[139.75,35.65],[139.85,35.65],[139.85,35.75],[139.75,35.75],[139.75,35.65]]]
    ])
    expect(mp2?.type).toBe('MultiPolygon')
    expect(mp2?.coordinates.length).toBe(2)
  })

  it('unionPolygon basic and digit rounding', () => {
    const p1 = [[139.67888894608188,35.709194315067336],[139.67888894608188,35.69791246840187],[139.69870010347233,35.69791246840187],[139.69870010347233,35.709194315067336],[139.67888894608188,35.709194315067336]]
    const p2 = [[139.67888894608188,35.709194315067336],[139.67888894608188,35.69791246840187],[139.69870010347233,35.69791246840187],[139.69870010347233,35.709194315067336],[139.67888894608188,35.709194315067336]]
    const u1 = eskamasu.unionPolygon([p1,p2])
    expect(u1).not.toBeNull()
    expect(['Polygon','MultiPolygon']).toContain(u1.type)

    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ [ [139.69271495922158,35.70799694030191],[139.69271495922158,35.704150935911485],[139.69713900584316,35.704150935911485],[139.69713900584316,35.70799694030191],[139.69271495922158,35.70799694030191] ] ] } },
        { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ [ [139.69836212461473,35.7063275436043],[139.69836212461473,35.70294637989724],[139.70307243307468,35.70294637989724],[139.70307243307468,35.7063275436043],[139.69836212461473,35.7063275436043] ] ] } },
      ]
    }
    const u2 = eskamasu.unionPolygon(fc, 9)
    expect(u2).not.toBeNull()
    expect(u2.type).toBe('MultiPolygon')
    const first = u2.coordinates[0][0][0]
    expect(first[0]).toBe(139.692714959)
    expect(first[1]).toBe(35.704150936)
  })

  it('invalid inputs', () => {
    expect(eskamasu.unionPolygon(null)).toBeNull()
    expect(eskamasu.unionPolygon([])).toBeNull()
    expect(eskamasu.unionPolygon([[0,0]])).toBeNull()
  })
})
