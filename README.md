# eskamasu

[![Tests](https://github.com/sera4am/eskamasu/actions/workflows/test.yml/badge.svg)](https://github.com/sera4am/eskamasu/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/eskamasu)](https://www.npmjs.com/package/eskamasu)

The es-toolkit edition of [ansuko](https://github.com/sera4am/ansuko) — a modern JavaScript/TypeScript utility library that extends [es-toolkit](https://github.com/toss/es-toolkit) (`es-toolkit/compat`, lodash-compatible) with practical, intuitive behaviors.

[English](./README.md) | [日本語](./README.ja.md) | [简体中文](./README.zh.md)

## Why eskamasu?

**eskamasu = es-toolkit + ansuko-style extensions.**

eskamasu is a sibling of [ansuko](https://github.com/sera4am/ansuko). The own functions and plugins (ja / geo / prototype) are identical; the only difference is the base library:

| | Base library | Pick it when... |
|---|---|---|
| [ansuko](https://github.com/sera4am/ansuko) | `lodash` | you want full lodash compatibility |
| **eskamasu** | `es-toolkit/compat` | you want es-toolkit as the base |

Unlike ansuko, eskamasu does not use a `_` object. All `es-toolkit/compat` functions and eskamasu's own functions are provided as **named exports**, so you can import only what you need (`import { isEmpty, get, valueOr } from 'eskamasu'`) and tree-shaking works.

```typescript
import { isEmpty, get, valueOr } from 'eskamasu'

isEmpty(0)              // false (eskamasu version)
get({ a: 1 }, 'a')      // 1 (es-toolkit/compat as-is)
```

## Installation

```bash
npm install eskamasu
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "eskamasu": "^0.2.0"
  }
}
```

## Core Philosophy

eskamasu eliminates common JavaScript frustrations with intuitive behaviors:

### Fixed lodash-compatible Quirks

`es-toolkit/compat` faithfully reproduces lodash behavior, including its quirks. eskamasu fixes them:

```typescript
// ❌ lodash / es-toolkit/compat (unintuitive)
isEmpty(0)           // true  - Is 0 really "empty"?
isEmpty(true)        // true  - Is true "empty"?
castArray(null)      // [null] - Why keep null?

// ✅ eskamasu (intuitive)
isEmpty(0)           // false - Numbers are not empty
isEmpty(true)        // false - Booleans are not empty
castArray(null)      // []    - Clean empty array
```

The originals can still be imported as `isEmptyOrg`, `toNumberOrg` and `castArrayOrg` (the `es-toolkit/compat` implementations).

### Safe JSON Handling

```typescript
// ❌ Standard JSON (annoying)
JSON.stringify('hello')  // '"hello"'  - Extra quotes!
JSON.parse(badJson)      // throws     - Need try-catch

// ✅ eskamasu (smooth)
jsonStringify('hello')     // null     - Not an object
jsonStringify({ a: 1 })    // '{"a":1}' - Clean
parseJSON(badJson)         // null     - No exceptions
parseJSON('{ a: 1, }')     // {a:1}    - JSON5 support!
```

### Promise-Aware Fallbacks

```typescript
// ❌ Verbose pattern
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ eskamasu (concise)
const result = await valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### Smart Comparisons

```typescript
// ❌ Verbose ternary hell
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ eskamasu (readable)
const value = equalsOr(a, b, defaultValue)  // null == undefined
```

## Key Features

### Enhanced es-toolkit/compat Functions

- **`isEmpty`** - Check if empty (numbers and booleans are NOT empty)
- **`castArray`** - Convert to array, returns `[]` for null/undefined
- All `es-toolkit/compat` functions remain available: `size`, `isNil`, `debounce`, `isEqual`, `keys`, `values`, `has`, etc. (see [Differences from lodash / ansuko](#differences-from-lodash--ansuko) for the few exceptions)

### Value Handling & Control Flow

- **`valueOr`** - Get value or default with Promise/function support
- **`emptyOr`** - Return null if empty, otherwise apply callback or return value
- **`hasOr`** - Check if paths exist, return default if missing (supports deep paths & Promises)
- **`equalsOr`** - Compare and fallback with intuitive nil handling (Promises supported)
- **`changes`** - Track object differences for DB updates (supports deep paths like `profile.tags[1]` & excludes mode)
- **`swallow`** - Execute function and return undefined on error (sync/async)
- **`swallowMap`** - Map over array, treating errors as undefined (with optional compact mode)

### Type Conversion & Validation

- **`toNumber`** - Parse numbers with comma/full-width support, optional `toFixed` rounding, returns `null` for invalid
- **`toBool`** - Smart boolean conversion ("yes"/"no"/"true"/"false"/numbers) with configurable undetected handling
- **`boolIf`** - Safe boolean conversion with fallback
- **`isValidStr`** - Non-empty string validation
- **`isValidEmail`** - Email format validation (strict: values with surrounding spaces are invalid)

### JSON Processing

- **`parseJSON`** - Safe JSON/JSON5 parsing without try-catch (supports comments & trailing commas)
- **`jsonStringify`** - Stringify only valid objects, prevents accidental string wrapping

### Array Utilities

- **`arrayDepth`** - Returns nesting depth of arrays (non-array: 0, empty array: 1)
- **`castArray`** - Convert to array, nil becomes `[]` (not `[null]`)

### Japanese Text (plugin: `eskamasu/plugins/ja`)

- **`kanaToFull`** - Half-width katakana → Full-width (e.g., `ｶﾞｷﾞ` → `ガギ`)
- **`kanaToHalf`** - Full-width → Half-width katakana (dakuten splits: `ガギ` → `ｶﾞｷﾞ`)
- **`kanaToHira`** - Katakana → Hiragana (auto-converts half-width first)
- **`hiraToKana`** - Hiragana → Katakana
- **`toHalfWidth`** - Full-width → Half-width with optional hyphen normalization
- **`toFullWidth`** - Half-width → Full-width with optional hyphen normalization
- **`haifun`** - Normalize various hyphens to single character

### Geo Utilities (plugin: `eskamasu/plugins/geo`)

- **`toGeoJson`** - Universal GeoJSON converter with auto-detection (tries dimensions from high to low)
- **`toPointGeoJson`** - Convert coords/object to Point GeoJSON
- **`toPolygonGeoJson`** - Convert outer ring to Polygon (validates closed ring)
- **`toLineStringGeoJson`** - Convert coords to LineString (checks self-intersection)
- **`toMultiPointGeoJson`** - Convert multiple points to MultiPoint
- **`toMultiPolygonGeoJson`** - Convert multiple polygons to MultiPolygon
- **`toMultiLineStringGeoJson`** - Convert multiple lines to MultiLineString
- **`unionPolygon`** - Union multiple Polygon/MultiPolygon into single geometry
- **`parseToTerraDraw`** - Convert GeoJSON to Terra Draw compatible features
- **`mZoomInterpolate`** - Convert zoom object to MapBox interpolation expression
- **`mProps`** - Convert camelCase properties to MapBox-compatible format (handles special cases like minzoom, visibility)

### Prototype Extensions (plugin: `eskamasu/plugins/prototype`)

- **`Array.prototype.notMap`** - Map with negated predicate → boolean array
- **`Array.prototype.notFilter`** - Filter by negated predicate (items that do NOT match)

### Timing Utilities

- **`waited`** - Delay execution by N animation frames (better than `setTimeout` for React/DOM)

## Plugin Architecture

eskamasu uses a core + opt-in plugin architecture:

- **Core**: all `es-toolkit/compat` functions plus eskamasu's own utilities
- **Japanese plugin**: only load if you need Japanese text processing
- **Geo plugin** (depends on @turf/turf): only load for GIS applications
- **Prototype plugin**: only load if you want Array prototype extensions

```typescript
// Core (all es-toolkit/compat functions + eskamasu's own functions)
import { isEmpty, valueOr } from 'eskamasu'

// Add Japanese support when needed
import { kanaToFull } from 'eskamasu/plugins/ja'

// Add GIS features for mapping apps
import { toPointGeoJson } from 'eskamasu/plugins/geo'
```

The `ja` / `geo` plugins are imported by name from their subpaths. Because they live on separate subpaths, heavy dependencies such as `@turf/turf` are only loaded when you import the plugin. Only the `prototype` plugin, since it extends `Array.prototype`, is used as a side-effect import (`import 'eskamasu/plugins/prototype'`).

## Quick Start

### Basic Usage

```typescript
import {
  isEmpty, castArray, toNumber, valueOr, parseJSON,
  isValidEmail, changes, swallow, swallowMap,
} from 'eskamasu'

// Enhanced es-toolkit/compat functions
isEmpty(0)           // false (not true like lodash / es-toolkit/compat!)
isEmpty([])          // true
castArray(null)      // [] (not [null]!)
toNumber('1,234.5')  // 1234.5

// Value handling with Promise support
const value = await valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// Safe JSON parsing
const data = parseJSON('{ "a": 1, /* comment */ }')  // Works with JSON5!

// Email validation
isValidEmail('user@example.com')  // true
isValidEmail(' user@example.com ') // false

// Track object changes for database updates
const diff = changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)

// Error handling without try-catch
const result = swallow(() => riskyOperation())  // undefined on error
const items = swallowMap([1, 2, 3], item => processItem(item), true)  // filter errors
```

### Using Plugins

#### Japanese Text Plugin

```typescript
import { kanaToFull, kanaToHira, toHalfWidth, haifun } from 'eskamasu/plugins/ja'

kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
kanaToHira('アイウ')             // 'あいう'
toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
haifun('test‐data', '-')       // 'test-data'
```

#### Geo Plugin

```typescript
import { toPointGeoJson, unionPolygon, mZoomInterpolate, mProps } from 'eskamasu/plugins/geo'

// Convert various formats to GeoJSON
toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// Union multiple polygons
const unified = unionPolygon([polygon1, polygon2])

// MapBox utilities
mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

mProps({
  fillColor: "#ff0000",
  sourceLayer: "buildings",
  visibility: true
})
// => { "fill-color": "#ff0000", "source-layer": "buildings", "visibility": "visible" }
```

#### Prototype Plugin

```typescript
import 'eskamasu/plugins/prototype'

// Now Array.prototype is extended
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2] (even numbers)
```

## Differences from lodash / ansuko

eskamasu re-exports every `es-toolkit/compat` function and overrides only `isEmpty` / `toNumber` / `castArray` with eskamasu's versions. The following lodash functions are not provided by `es-toolkit/compat`, so they are **not available**:

- `chain`
- `mixin`
- `sortedUniq`, `sortedUniqBy`
- `tap`, `thru`
- `noConflict`
- `runInContext`

Wrapper-style calls such as `_(value).map(...)` are not supported (they were not supported in ansuko either).

Also, unlike ansuko, there is no default `_` export, and plugins are provided as named exports instead of extending `_`. The functions themselves — including eskamasu's own functions and plugins — behave the same as in ansuko.

## Documentation

eskamasu's own functions and plugins share the same API as ansuko, so ansuko's documentation applies as-is (read `_.isEmpty(x)` as `isEmpty(x)` after `import { isEmpty } from 'eskamasu'`):

- **[API Reference](https://github.com/sera4am/ansuko/blob/main/docs/API.md)** - Complete API documentation with examples
- **[Usage Guide](https://github.com/sera4am/ansuko/blob/main/docs/Guide.md)** - Real-world examples and patterns

## TypeScript Support

Full TypeScript support with type definitions included. All functions are fully typed with generic support.

## Why not just use lodash / es-toolkit?

lodash is excellent, and es-toolkit/compat brings lodash compatibility to a modern codebase — but that compatibility includes some quirks that have been [criticized by the community](https://github.com/lodash/lodash/issues):

### Fixed Behaviors

1. **`_.isEmpty(true)` returns `true`** - Is a boolean really "empty"?
2. **`_.isEmpty(1)` returns `true`** - Is the number 1 "empty"?
3. **`_.castArray(null)` returns `[null]`** - Why include null in the array?

### Added Utilities Missing in lodash / es-toolkit

4. **No safe JSON parsing** - Always need try-catch blocks
5. **No built-in comparison with fallback** - Verbose ternary patterns everywhere
6. **No Promise-aware value resolution** - Manual Promise handling gets messy
7. **No object diff tracking** - Need external libs for DB updates
8. **`JSON.stringify("hello")` adds quotes** - Those `'"hello"'` quotes are annoying

### Real-World Example

```typescript
// Common pattern with lodash / es-toolkit (verbose & error-prone)
let data
try {
  const cached = cache.get(id)
  if (cached && !_.isEmpty(cached)) {
    data = cached
  } else {
    const fetched = await api.fetch(id)
    data = fetched || defaultValue
  }
} catch (e) {
  data = defaultValue
}

// Same logic with eskamasu (concise & safe)
const data = await valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

eskamasu keeps the `es-toolkit/compat` API importable as-is (except for the functions listed in [Differences from lodash / ansuko](#differences-from-lodash--ansuko)) while fixing these issues and adding powerful utilities for modern JavaScript development.

## Dependencies

- **`es-toolkit`** - Core utility functions (via `es-toolkit/compat`)
- **`json5`** - Enhanced JSON parsing with comments and trailing commas support
- **`@turf/turf`** - Geospatial analysis (used by geo plugin)

## Building from Source

```bash
npm install
npm run build
```

This will generate the compiled JavaScript and type definitions in the `dist` directory.

## Development
Developed by Sera with assistance from Claude (Anthropic) for documentation, code review, and technical discussions.

## License

MIT

## Author

Naoto Sera
