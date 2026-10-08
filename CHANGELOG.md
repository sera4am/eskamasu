# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

eskamasu is the es-toolkit edition of [ansuko](https://github.com/sera4am/ansuko) (forked from ansuko v2.0.11).

## [Unreleased]

## [0.1.0] - 2026-10-09

### Added
- Initial release. Same API and plugins (`ja` / `geo` / `prototype`) as ansuko v2.0.11, built on `es-toolkit/compat` instead of `lodash`.
- `EskamasuType` extends `Omit<typeof import("es-toolkit/compat"), ...>`, so all es-toolkit/compat functions are typed on `_`.

### Removed
- Not available compared to ansuko (missing in es-toolkit/compat): `chain`, `mixin`, `sortedUniq`, `sortedUniqBy`, `tap`, `thru`, `noConflict`, `runInContext`.

[Unreleased]: https://github.com/sera4am/eskamasu/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sera4am/eskamasu/releases/tag/v0.1.0
