# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-19

### Added
- **TypeScript rewrite** - Full TypeScript source with type definitions
- **128-bit hash functions** - `hash128()` (x86) and `hash128x64()` (x64)
- **Streaming API** - `createHash32()`, `createHash128()`, `createHash128x64()`
- **BigInt output** - Option to return 128-bit hashes as BigInt
- **Uint8Array support** - Hash binary data directly
- **Dual format build** - ESM and CJS outputs
- **Benchmarks** - Performance testing with `npm run bench`

### Changed
- **Flat API** - Use `hash32()`, `hash128()`, `hash128x64()` directly
- **Zero dependencies** - Removed `debug` dependency
- **Modern target** - Requires Node.js 20+

### Deprecated
- **v3 API** - `v3.x86.hash32()` etc. still work but show deprecation warning

### Removed
- **Node.js < 20 support** - Now requires Node.js 20+

## [1.0.0] - 2015-02-01

### Added
- Initial release
- MurmurHash3 x86 32-bit and 128-bit
- MurmurHash3 x64 128-bit
