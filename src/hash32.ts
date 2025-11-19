import type { HashInput } from './types.ts';
import { toBytes } from './encoding.ts';

// MurmurHash3 constants
const C1 = 0xcc9e2d51;
const C2 = 0x1b873593;

/**
 * 32-bit multiplication with overflow handling
 */
function multiply(a: number, b: number): number {
  return ((a & 0xffff) * b + ((((a >>> 16) * b) & 0xffff) << 16)) | 0;
}

/**
 * 32-bit rotate left
 */
function rotl(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift));
}

/**
 * Final mix function
 */
function fmix(h: number): number {
  h ^= h >>> 16;
  h = multiply(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = multiply(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h;
}

/**
 * Compute MurmurHash3 x86 32-bit hash
 */
function compute(bytes: Uint8Array, seed: number): number {
  const len = bytes.length;
  const blocks = len >>> 2; // len / 4
  let h1 = seed;

  // Process 4-byte blocks
  for (let i = 0; i < blocks; i++) {
    const offset = i * 4;
    let k1 =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24);

    k1 = multiply(k1, C1);
    k1 = rotl(k1, 15);
    k1 = multiply(k1, C2);

    h1 ^= k1;
    h1 = rotl(h1, 13);
    h1 = multiply(h1, 5) + 0xe6546b64;
  }

  // Process remaining bytes
  const tailOffset = blocks * 4;
  let k1 = 0;

  switch (len & 3) {
    case 3:
      k1 ^= bytes[tailOffset + 2] << 16;
    // fallthrough
    case 2:
      k1 ^= bytes[tailOffset + 1] << 8;
    // fallthrough
    case 1:
      k1 ^= bytes[tailOffset];
      k1 = multiply(k1, C1);
      k1 = rotl(k1, 15);
      k1 = multiply(k1, C2);
      h1 ^= k1;
  }

  // Finalization
  h1 ^= len;
  h1 = fmix(h1);

  return h1 >>> 0; // Convert to unsigned
}

/**
 * Compute MurmurHash3 x86 32-bit hash.
 */
export function hash32(input: HashInput, seed: number = 0): number {
  return compute(toBytes(input), seed);
}

export class Hash32Stream {
  private chunks: Uint8Array[] = [];
  private totalLength = 0;
  private readonly seed: number;

  constructor(seed: number = 0) {
    this.seed = seed;
  }

  update(input: HashInput): this {
    const bytes = toBytes(input);
    this.chunks.push(bytes);
    this.totalLength += bytes.length;
    return this;
  }

  digest(): number {
    const result = new Uint8Array(this.totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return compute(result, this.seed);
  }
}

/**
 * Create a streaming hasher for MurmurHash3 x86 32-bit.
 */
export function createHash32(seed: number = 0): Hash32Stream {
  return new Hash32Stream(seed);
}
