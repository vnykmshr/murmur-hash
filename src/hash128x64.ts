import type { HashInput, Hash128Options } from './types.ts';
import { toBytes, hexToBigInt } from './encoding.ts';

// MurmurHash3 x64 128-bit constants (as pairs of 32-bit ints)
const C1 = [0x87c37b91, 0x114253d5];
const C2 = [0x4cf5ad43, 0x2745937f];

/**
 * 64-bit addition (as array of two 32-bit ints)
 */
function add64(a: number[], b: number[]): number[] {
  const a0 = a[0] >>> 16,
    a1 = a[0] & 0xffff,
    a2 = a[1] >>> 16,
    a3 = a[1] & 0xffff;
  const b0 = b[0] >>> 16,
    b1 = b[0] & 0xffff,
    b2 = b[1] >>> 16,
    b3 = b[1] & 0xffff;

  let c0 = 0,
    c1 = 0,
    c2 = 0,
    c3 = 0;

  c3 += a3 + b3;
  c2 += c3 >>> 16;
  c3 &= 0xffff;

  c2 += a2 + b2;
  c1 += c2 >>> 16;
  c2 &= 0xffff;

  c1 += a1 + b1;
  c0 += c1 >>> 16;
  c1 &= 0xffff;

  c0 += a0 + b0;
  c0 &= 0xffff;

  return [(c0 << 16) | c1, (c2 << 16) | c3];
}

/**
 * 64-bit multiplication (as array of two 32-bit ints)
 */
function multiply64(a: number[], b: number[]): number[] {
  const a0 = a[0] >>> 16,
    a1 = a[0] & 0xffff,
    a2 = a[1] >>> 16,
    a3 = a[1] & 0xffff;
  const b0 = b[0] >>> 16,
    b1 = b[0] & 0xffff,
    b2 = b[1] >>> 16,
    b3 = b[1] & 0xffff;

  let c0 = 0,
    c1 = 0,
    c2 = 0,
    c3 = 0;

  c3 += a3 * b3;
  c2 += c3 >>> 16;
  c3 &= 0xffff;

  c2 += a2 * b3;
  c1 += c2 >>> 16;
  c2 &= 0xffff;

  c2 += a3 * b2;
  c1 += c2 >>> 16;
  c2 &= 0xffff;

  c1 += a1 * b3;
  c0 += c1 >>> 16;
  c1 &= 0xffff;

  c1 += a2 * b2;
  c0 += c1 >>> 16;
  c1 &= 0xffff;

  c1 += a3 * b1;
  c0 += c1 >>> 16;
  c1 &= 0xffff;

  c0 += a0 * b3 + a1 * b2 + a2 * b1 + a3 * b0;
  c0 &= 0xffff;

  return [(c0 << 16) | c1, (c2 << 16) | c3];
}

/**
 * 64-bit rotate left
 */
function rotl64(m: number[], n: number): number[] {
  n %= 64;
  if (n === 32) {
    return [m[1], m[0]];
  } else if (n < 32) {
    return [
      (m[0] << n) | (m[1] >>> (32 - n)),
      (m[1] << n) | (m[0] >>> (32 - n)),
    ];
  } else {
    n -= 32;
    return [
      (m[1] << n) | (m[0] >>> (32 - n)),
      (m[0] << n) | (m[1] >>> (32 - n)),
    ];
  }
}

/**
 * 64-bit left shift
 */
function lshift64(m: number[], n: number): number[] {
  n %= 64;
  if (n === 0) {
    return m;
  } else if (n < 32) {
    return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
  } else {
    return [m[1] << (n - 32), 0];
  }
}

/**
 * 64-bit XOR
 */
function xor64(a: number[], b: number[]): number[] {
  return [a[0] ^ b[0], a[1] ^ b[1]];
}

/**
 * Final mix function for 64-bit
 */
function fmix64(h: number[]): number[] {
  h = xor64(h, [0, h[0] >>> 1]);
  h = multiply64(h, [0xff51afd7, 0xed558ccd]);
  h = xor64(h, [0, h[0] >>> 1]);
  h = multiply64(h, [0xc4ceb9fe, 0x1a85ec53]);
  h = xor64(h, [0, h[0] >>> 1]);
  return h;
}

/**
 * Compute MurmurHash3 x64 128-bit hash
 */
function compute(bytes: Uint8Array, seed: number): string {
  const len = bytes.length;
  const blocks = len >>> 4; // len / 16

  let h1: number[] = [0, seed];
  let h2: number[] = [0, seed];

  // Process 16-byte blocks
  for (let i = 0; i < blocks; i++) {
    const offset = i * 16;

    let k1: number[] = [
      bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24),
      bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24),
    ];

    let k2: number[] = [
      bytes[offset + 12] |
        (bytes[offset + 13] << 8) |
        (bytes[offset + 14] << 16) |
        (bytes[offset + 15] << 24),
      bytes[offset + 8] |
        (bytes[offset + 9] << 8) |
        (bytes[offset + 10] << 16) |
        (bytes[offset + 11] << 24),
    ];

    k1 = multiply64(k1, C1);
    k1 = rotl64(k1, 31);
    k1 = multiply64(k1, C2);
    h1 = xor64(h1, k1);

    h1 = rotl64(h1, 27);
    h1 = add64(h1, h2);
    h1 = add64(multiply64(h1, [0, 5]), [0, 0x52dce729]);

    k2 = multiply64(k2, C2);
    k2 = rotl64(k2, 33);
    k2 = multiply64(k2, C1);
    h2 = xor64(h2, k2);

    h2 = rotl64(h2, 31);
    h2 = add64(h2, h1);
    h2 = add64(multiply64(h2, [0, 5]), [0, 0x38495ab5]);
  }

  // Process remaining bytes
  const tailOffset = blocks * 16;
  let k1: number[] = [0, 0];
  let k2: number[] = [0, 0];

  switch (len & 15) {
    case 15:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 14]], 48));
    // fallthrough
    case 14:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 13]], 40));
    // fallthrough
    case 13:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 12]], 32));
    // fallthrough
    case 12:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 11]], 24));
    // fallthrough
    case 11:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 10]], 16));
    // fallthrough
    case 10:
      k2 = xor64(k2, lshift64([0, bytes[tailOffset + 9]], 8));
    // fallthrough
    case 9:
      k2 = xor64(k2, [0, bytes[tailOffset + 8]]);
      k2 = multiply64(k2, C2);
      k2 = rotl64(k2, 33);
      k2 = multiply64(k2, C1);
      h2 = xor64(h2, k2);
    // fallthrough
    case 8:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 7]], 56));
    // fallthrough
    case 7:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 6]], 48));
    // fallthrough
    case 6:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 5]], 40));
    // fallthrough
    case 5:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 4]], 32));
    // fallthrough
    case 4:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 3]], 24));
    // fallthrough
    case 3:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 2]], 16));
    // fallthrough
    case 2:
      k1 = xor64(k1, lshift64([0, bytes[tailOffset + 1]], 8));
    // fallthrough
    case 1:
      k1 = xor64(k1, [0, bytes[tailOffset]]);
      k1 = multiply64(k1, C1);
      k1 = rotl64(k1, 31);
      k1 = multiply64(k1, C2);
      h1 = xor64(h1, k1);
  }

  // Finalization
  h1 = xor64(h1, [0, len]);
  h2 = xor64(h2, [0, len]);

  h1 = add64(h1, h2);
  h2 = add64(h2, h1);

  h1 = fmix64(h1);
  h2 = fmix64(h2);

  h1 = add64(h1, h2);
  h2 = add64(h2, h1);

  // Convert to hex string
  return (
    ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8)
  );
}

/**
 * Compute MurmurHash3 x64 128-bit hash.
 */
export function hash128x64(
  input: HashInput,
  options?: Hash128Options
): string | bigint {
  const seed = options?.seed ?? 0;
  const hex = compute(toBytes(input), seed);

  if (options?.output === 'bigint') {
    return hexToBigInt(hex);
  }
  return hex;
}

/** Streaming hasher. Note: data is buffered until digest(), not processed incrementally. */
export class Hash128x64Stream {
  private chunks: Uint8Array[] = [];
  private totalLength = 0;
  private readonly seed: number;
  private readonly outputFormat: 'hex' | 'bigint';

  constructor(options?: Hash128Options) {
    this.seed = options?.seed ?? 0;
    this.outputFormat = options?.output ?? 'hex';
  }

  update(input: HashInput): this {
    const bytes = toBytes(input);
    this.chunks.push(bytes);
    this.totalLength += bytes.length;
    return this;
  }

  digest(): string | bigint {
    const result = new Uint8Array(this.totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    const hex = compute(result, this.seed);

    if (this.outputFormat === 'bigint') {
      return hexToBigInt(hex);
    }
    return hex;
  }
}

/**
 * Create a streaming hasher for MurmurHash3 x64 128-bit.
 */
export function createHash128x64(options?: Hash128Options): Hash128x64Stream {
  return new Hash128x64Stream(options);
}
