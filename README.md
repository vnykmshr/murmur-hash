# murmur-hash

Fast MurmurHash3 implementation with **128-bit support** for Node.js and browsers.

## Why This Package?

Most MurmurHash packages only support 32-bit hashes. This package provides the **complete MurmurHash3 suite** including 128-bit variants, which are essential for:

- **Bloom filters** - Need 128-bit hashes to minimize false positives
- **Distributed systems** - Better collision resistance for sharding/partitioning
- **Content fingerprinting** - 128-bit provides stronger uniqueness guarantees

All in a pure JavaScript implementation with zero dependencies.

## Installation

```bash
npm install murmur-hash
```

## Quick Start

```typescript
import { hash32, hash128, hash128x64 } from 'murmur-hash';

// 32-bit hash (fast, good for hash tables)
hash32('hello');                  // 613153351

// 128-bit x86 (better collision resistance)
hash128('hello');                 // '2360ae465e6336c6ad45b3f4ad45b3f4'

// 128-bit x64 (optimized for 64-bit platforms)
hash128x64('hello');              // 'cbd8a7b341bd9b025b1e906a48ae1d19'
```

## API Reference

### hash32(input, seed?)

Compute a 32-bit hash.

```typescript
hash32('hello')                   // 613153351
hash32('hello', 42)               // with seed
hash32(new Uint8Array([1,2,3]))   // binary data
```

### hash128(input, options?)

Compute a 128-bit hash using x86 algorithm.

```typescript
hash128('hello')                         // hex string
hash128('hello', { seed: 42 })           // with seed
hash128('hello', { output: 'bigint' })   // as BigInt
```

### hash128x64(input, options?)

Compute a 128-bit hash using x64 algorithm.

```typescript
hash128x64('hello')                         // hex string
hash128x64('hello', { seed: 42 })           // with seed
hash128x64('hello', { output: 'bigint' })   // as BigInt
```

### Streaming API

For large data or incremental hashing:

```typescript
import { createHash32, createHash128, createHash128x64 } from 'murmur-hash';

const hasher = createHash32();
hasher.update('hello');
hasher.update(' world');
hasher.digest();  // same as hash32('hello world')

// With options
const hasher128 = createHash128({ seed: 42, output: 'bigint' });
hasher128.update(chunk1);
hasher128.update(chunk2);
hasher128.digest();
```

## Types

```typescript
type HashInput = string | Uint8Array;

interface Hash128Options {
  seed?: number;           // default: 0
  output?: 'hex' | 'bigint';  // default: 'hex'
}
```

## Migration from v1

The v1 API is still supported but deprecated:

```typescript
// v1 (deprecated)
import { v3 } from 'murmur-hash';
v3.x86.hash32('hello');
v3.x86.hash128('hello');
v3.x64.hash128('hello');

// v2 (recommended)
import { hash32, hash128, hash128x64 } from 'murmur-hash';
hash32('hello');
hash128('hello');
hash128x64('hello');
```

## Migration from murmurhash-js

```typescript
// murmurhash-js (32-bit only)
import murmurhash from 'murmurhash-js';
murmurhash.murmur3('hello');

// murmur-hash (32-bit + 128-bit)
import { hash32, hash128 } from 'murmur-hash';
hash32('hello');
hash128('hello');  // 128-bit not available in murmurhash-js
```

## Performance

Benchmarks on Apple M1:

| Function | ops/sec | Input |
|----------|---------|-------|
| hash32 | 2,000,000+ | short string |
| hash32 | 560,000 | 1KB bytes |
| hash128 | 540,000 | short string |
| hash128 | 350,000 | 1KB bytes |
| hash128x64 | 530,000 | short string |
| hash128x64 | 35,000 | 1KB bytes |

Run benchmarks locally:
```bash
npm run bench
```

## Use Cases

### Bloom Filters

```typescript
import { hash128 } from 'murmur-hash';

function bloomFilterHashes(item: string, k: number): number[] {
  const h = hash128(item, { output: 'bigint' }) as bigint;
  const h1 = Number(h >> 64n);
  const h2 = Number(h & 0xFFFFFFFFFFFFFFFFn);

  return Array.from({ length: k }, (_, i) =>
    Math.abs((h1 + i * h2) % (1 << 24))
  );
}
```

### Consistent Hashing

```typescript
import { hash32 } from 'murmur-hash';

function getPartition(key: string, numPartitions: number): number {
  return hash32(key) % numPartitions;
}
```

### Content Fingerprinting

```typescript
import { hash128x64 } from 'murmur-hash';

function fingerprint(content: string): string {
  return hash128x64(content) as string;
}
```

## Requirements

- Node.js 18+ or modern browsers (ES2020)

## License

MIT

## Contributing

Issues and PRs welcome at [github.com/vnykmshr/murmur-hash](https://github.com/vnykmshr/murmur-hash).
