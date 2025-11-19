# murmur-hash

MurmurHash3 for Node.js and browsers. Includes 32-bit and 128-bit variants.

> **Note:** MurmurHash is non-cryptographic. Do not use for passwords, security tokens, or other sensitive data.

[![npm version](https://img.shields.io/npm/v/murmur-hash.svg)](https://www.npmjs.com/package/murmur-hash)
[![CI](https://github.com/vnykmshr/murmur-hash/actions/workflows/ci.yml/badge.svg)](https://github.com/vnykmshr/murmur-hash/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 32-bit and 128-bit hash outputs
- x86 and x64 128-bit variants
- Streaming API for large data
- String and Uint8Array inputs
- TypeScript definitions included
- Zero dependencies

## Installation

```bash
npm install murmur-hash
```

## Quick Start

```js
import { hash32, hash128, hash128x64 } from 'murmur-hash';

hash32('hello');       // 613153351
hash128('hello');      // '2360ae465e6336c6ad45b3f4ad45b3f4'
hash128x64('hello');   // 'cbd8a7b341bd9b025b1e906a48ae1d19'
```

## API

### hash32(input, seed?)

Returns a 32-bit unsigned integer.

```js
hash32('hello')                   // 613153351
hash32('hello', 42)               // with seed
hash32(new Uint8Array([1,2,3]))   // binary input
```

### hash128(input, options?)

Returns a 128-bit hash (x86 variant) as hex string or BigInt.

```js
hash128('hello')                         // hex string
hash128('hello', { seed: 42 })           // with seed
hash128('hello', { output: 'bigint' })   // as BigInt
```

### hash128x64(input, options?)

Returns a 128-bit hash (x64 variant) as hex string or BigInt.

```js
hash128x64('hello')                         // hex string
hash128x64('hello', { seed: 42 })           // with seed
hash128x64('hello', { output: 'bigint' })   // as BigInt
```

### Streaming

```js
import { createHash32, createHash128, createHash128x64 } from 'murmur-hash';

const hasher = createHash32();
hasher.update('hello');
hasher.update(' world');
hasher.digest();  // same as hash32('hello world')
```

## Types

```ts
type HashInput = string | Uint8Array;

interface Hash128Options {
  seed?: number;              // default: 0
  output?: 'hex' | 'bigint';  // default: 'hex'
}
```

## Performance

Benchmarks on Apple M1 (ops/sec):

```
hash32     short string    2,000,000+
hash32     1KB bytes         560,000
hash128    short string      540,000
hash128    1KB bytes         350,000
hash128x64 short string      530,000
hash128x64 1KB bytes          35,000
```

Run locally: `npm run bench`

## Migration from v1

The v1 API still works but is deprecated:

```js
// v1 (deprecated)
import { v3 } from 'murmur-hash';
v3.x86.hash32('hello');

// v2
import { hash32 } from 'murmur-hash';
hash32('hello');
```

## Requirements

Node.js 18+ or modern browsers (ES2020).

## License

MIT
