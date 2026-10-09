# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

eskamasu is the es-toolkit edition of [ansuko](https://github.com/sera4am/ansuko) (forked from ansuko v2.0.11).

## [Unreleased]

## [0.2.0] - 2026-10-09

### Changed (BREAKING)
- Switched from a default `_` object to named exports. Use `import { isEmpty, get, valueOr } from "eskamasu"` instead of `import _ from "eskamasu"`. All `es-toolkit/compat` functions are re-exported; `isEmpty` / `toNumber` / `castArray` are overridden by the eskamasu versions. This makes eskamasu tree-shakable.
- Plugins `ja` / `geo` no longer extend `_` via side-effect import. Import functions by name from the subpath instead, e.g. `import { kanaToFull } from "eskamasu/plugins/ja"`. The `prototype` plugin is still a side-effect import.

### Added
- `toBool`, `emptyOr`, `hasOr`, `isEmptyOrg`, `toNumberOrg`, `castArrayOrg` are now available as named exports (previously only reachable via `_`).
- `sideEffects` field in `package.json` so bundlers can tree-shake everything except `plugins/prototype`.

### Removed (BREAKING)
- Default export `_`, the `EskamasuType` interface, the plugin extension interfaces (`EskamasuJaExtension` / `EskamasuGeoPluginExtension`), and the `_.__plugins` registry.

### Fixed
- `kanaToFull` / `kanaToHalf` / `toFullWidth` (ja plugin): half-width parentheses `(` `)` were converted to the string `"undefined"` (and `kanaToHalf` produced `\(` / `\)`). Map keys are now plain characters and are regex-escaped when building the pattern. The regexes and reverse map are now built once instead of on every call.

## [0.1.0] - 2026-10-09

### Added
- Initial release. Same API and plugins (`ja` / `geo` / `prototype`) as ansuko v2.0.11, built on `es-toolkit/compat` instead of `lodash`.
- `EskamasuType` extends `Omit<typeof import("es-toolkit/compat"), ...>`, so all es-toolkit/compat functions are typed on `_`.

### Removed
- Not available compared to ansuko (missing in es-toolkit/compat): `chain`, `mixin`, `sortedUniq`, `sortedUniqBy`, `tap`, `thru`, `noConflict`, `runInContext`.

[Unreleased]: https://github.com/sera4am/eskamasu/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sera4am/eskamasu/releases/tag/v0.2.0
[0.1.0]: https://github.com/sera4am/eskamasu/releases/tag/v0.1.0
