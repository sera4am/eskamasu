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

Like ansuko, everything is bundled under a single `_` object. This is intentional: it avoids polluting your module scope with short, generic names (`map`, `get`, `toNumber`, ...). As a consequence, tree-shaking is not a goal of this library.

## Installation

```bash
npm install eskamasu
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "eskamasu": "^0.1.0"
  }
}
```

## Core Philosophy

eskamasu eliminates common JavaScript frustrations with intuitive behaviors:

### Fixed lodash-compatible Quirks

`es-toolkit/compat` faithfully reproduces lodash behavior, including its quirks. eskamasu fixes them:

```typescript
// ❌ lodash / es-toolkit/compat (unintuitive)
_.isEmpty(0)           // true  - Is 0 really "empty"?
_.isEmpty(true)        // true  - Is true "empty"?
_.castArray(null)      // [null] - Why keep null?

// ✅ eskamasu (intuitive)
_.isEmpty(0)           // false - Numbers are not empty
_.isEmpty(true)        // false - Booleans are not empty
_.castArray(null)      // []    - Clean empty array
```

The originals are still available as `_.isEmptyOrg`, `_.toNumberOrg` and `_.castArrayOrg` (the `es-toolkit/compat` implementations).

### Safe JSON Handling

```typescript
// ❌ Standard JSON (annoying)
JSON.stringify('hello')  // '"hello"'  - Extra quotes!
JSON.parse(badJson)      // throws     - Need try-catch

// ✅ eskamasu (smooth)
_.jsonStringify('hello')     // null     - Not an object
_.jsonStringify({ a: 1 })    // '{"a":1}' - Clean
_.parseJSON(badJson)         // null     - No exceptions
_.parseJSON('{ a: 1, }')     // {a:1}    - JSON5 support!
```

### Promise-Aware Fallbacks

```typescript
// ❌ Verbose pattern
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ eskamasu (concise)
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### Smart Comparisons

```typescript
// ❌ Verbose ternary hell
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ eskamasu (readable)
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
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
// Core
import _ from 'eskamasu'

// Add Japanese support when needed
import 'eskamasu/plugins/ja'  // side-effect import

// Add GIS features for mapping apps
import 'eskamasu/plugins/geo'
```

Plugins are loaded as side-effect imports. Just `import 'eskamasu/plugins/<name>'` once and `_` is augmented in both runtime and type system (via TypeScript's `declare module` merging), so IDE autocompletion works directly on `_`. A plugin you don't import is not bundled.

## Quick Start

### Basic Usage

```typescript
import _ from 'eskamasu'

// Enhanced es-toolkit/compat functions
_.isEmpty(0)           // false (not true like lodash / es-toolkit/compat!)
_.isEmpty([])          // true
_.castArray(null)      // [] (not [null]!)
_.toNumber('1,234.5')  // 1234.5

// Value handling with Promise support
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// Safe JSON parsing
const data = _.parseJSON('{ "a": 1, /* comment */ }')  // Works with JSON5!

// Email validation
_.isValidEmail('user@example.com')  // true
_.isValidEmail(' user@example.com ') // false

// Track object changes for database updates
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)

// Error handling without try-catch
const result = _.swallow(() => riskyOperation())  // undefined on error
const items = _.swallowMap([1, 2, 3], item => processItem(item), true)  // filter errors
```

### Using Plugins

#### Japanese Text Plugin

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'

_.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
_.kanaToHira('アイウ')             // 'あいう'
_.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
_.haifun('test‐data', '-')       // 'test-data'
```

#### Geo Plugin

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/geo'

// Convert various formats to GeoJSON
_.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

_.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// Union multiple polygons
const unified = _.unionPolygon([polygon1, polygon2])

// MapBox utilities
_.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

_.mProps({
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

### Combining Plugins

```typescript
import _ from 'eskamasu'
import 'eskamasu/plugins/ja'
import 'eskamasu/plugins/geo'

// Now you have both Japanese and Geo utilities on `_`
_.kanaToHira('アイウ')
_.toPointGeoJson([139.7, 35.6])
```

Each plugin registers itself exactly once, even if imported from multiple files (a duplicate-registration guard is built in).

## Differences from lodash / ansuko

`_` is `{ ...es-toolkit/compat, ...eskamasu's own functions }`. The following lodash functions are not provided by `es-toolkit/compat`, so they are **not available** on `_`:

- `chain`
- `mixin`
- `sortedUniq`, `sortedUniqBy`
- `tap`, `thru`
- `noConflict`
- `runInContext`

Wrapper-style calls such as `_(value).map(...)` are not supported (they were not supported in ansuko either). Everything else — including eskamasu's own functions and plugins — behaves the same as in ansuko.

## Documentation

eskamasu's own functions and plugins share the same API as ansuko, so ansuko's documentation applies as-is (just replace `ansuko` with `eskamasu` in import paths):

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
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

eskamasu keeps the `es-toolkit/compat` API available on `_` (except for the functions listed in [Differences from lodash / ansuko](#differences-from-lodash--ansuko)) while fixing these issues and adding powerful utilities for modern JavaScript development.

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
