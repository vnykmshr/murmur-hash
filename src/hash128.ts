import type { HashInput, Hash128Options } from './types.ts';
import { toBytes, hexToBigInt } from './encoding.ts';

// MurmurHash3 x86 128-bit constants
const C1 = 0x239b961b;
const C2 = 0xab0e9789;
const C3 = 0x38b34ae5;
const C4 = 0xa1e38b93;

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
 * Compute MurmurHash3 x86 128-bit hash
 */
function compute(bytes: Uint8Array, seed: number): string {
  const len = bytes.length;
  const blocks = len >>> 4; // len / 16

  let h1 = seed;
  let h2 = seed;
  let h3 = seed;
  let h4 = seed;

  // Process 16-byte blocks
  for (let i = 0; i < blocks; i++) {
    const offset = i * 16;

    let k1 =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24);
    let k2 =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24);
    let k3 =
      bytes[offset + 8] |
      (bytes[offset + 9] << 8) |
      (bytes[offset + 10] << 16) |
      (bytes[offset + 11] << 24);
    let k4 =
      bytes[offset + 12] |
      (bytes[offset + 13] << 8) |
      (bytes[offset + 14] << 16) |
      (bytes[offset + 15] << 24);

    k1 = multiply(k1, C1);
    k1 = rotl(k1, 15);
    k1 = multiply(k1, C2);
    h1 ^= k1;

    h1 = rotl(h1, 19);
    h1 += h2;
    h1 = multiply(h1, 5) + 0x561ccd1b;

    k2 = multiply(k2, C2);
    k2 = rotl(k2, 16);
    k2 = multiply(k2, C3);
    h2 ^= k2;

    h2 = rotl(h2, 17);
    h2 += h3;
    h2 = multiply(h2, 5) + 0x0bcaa747;

    k3 = multiply(k3, C3);
    k3 = rotl(k3, 17);
    k3 = multiply(k3, C4);
    h3 ^= k3;

    h3 = rotl(h3, 15);
    h3 += h4;
    h3 = multiply(h3, 5) + 0x96cd1c35;

    k4 = multiply(k4, C4);
    k4 = rotl(k4, 18);
    k4 = multiply(k4, C1);
    h4 ^= k4;

    h4 = rotl(h4, 13);
    h4 += h1;
    h4 = multiply(h4, 5) + 0x32ac3b17;
  }

  // Process remaining bytes
  const tailOffset = blocks * 16;
  let k1 = 0;
  let k2 = 0;
  let k3 = 0;
  let k4 = 0;

  switch (len & 15) {
    case 15:
      k4 ^= bytes[tailOffset + 14] << 16;
    // fallthrough
    case 14:
      k4 ^= bytes[tailOffset + 13] << 8;
    // fallthrough
    case 13:
      k4 ^= bytes[tailOffset + 12];
      k4 = multiply(k4, C4);
      k4 = rotl(k4, 18);
      k4 = multiply(k4, C1);
      h4 ^= k4;
    // fallthrough
    case 12:
      k3 ^= bytes[tailOffset + 11] << 24;
    // fallthrough
    case 11:
      k3 ^= bytes[tailOffset + 10] << 16;
    // fallthrough
    case 10:
      k3 ^= bytes[tailOffset + 9] << 8;
    // fallthrough
    case 9:
      k3 ^= bytes[tailOffset + 8];
      k3 = multiply(k3, C3);
      k3 = rotl(k3, 17);
      k3 = multiply(k3, C4);
      h3 ^= k3;
    // fallthrough
    case 8:
      k2 ^= bytes[tailOffset + 7] << 24;
    // fallthrough
    case 7:
      k2 ^= bytes[tailOffset + 6] << 16;
    // fallthrough
    case 6:
      k2 ^= bytes[tailOffset + 5] << 8;
    // fallthrough
    case 5:
      k2 ^= bytes[tailOffset + 4];
      k2 = multiply(k2, C2);
      k2 = rotl(k2, 16);
      k2 = multiply(k2, C3);
      h2 ^= k2;
    // fallthrough
    case 4:
      k1 ^= bytes[tailOffset + 3] << 24;
    // fallthrough
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
  h2 ^= len;
  h3 ^= len;
  h4 ^= len;

  h1 += h2;
  h1 += h3;
  h1 += h4;
  h2 += h1;
  h3 += h1;
  h4 += h1;

  h1 = fmix(h1);
  h2 = fmix(h2);
  h3 = fmix(h3);
  h4 = fmix(h4);

  h1 += h2;
  h1 += h3;
  h1 += h4;
  h2 += h1;
  h3 += h1;
  h4 += h1;

  // Convert to hex string
  return (
    ('00000000' + (h1 >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h2 >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h3 >>> 0).toString(16)).slice(-8) +
    ('00000000' + (h4 >>> 0).toString(16)).slice(-8)
  );
}

/**
 * Compute MurmurHash3 x86 128-bit hash
 *
 * @param input - String or Uint8Array to hash
 * @param options - Optional seed and output format
 * @returns 128-bit hash as hex string or BigInt
 *
 * @example
 * ```ts
 * hash128('hello')                        // hex string
 * hash128('hello', { seed: 42 })          // with seed
 * hash128('hello', { output: 'bigint' })  // as BigInt
 * ```
 */
export function hash128(
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

/**
 * Streaming hasher for MurmurHash3 x86 128-bit
 */
export class Hash128Stream {
  private chunks: Uint8Array[] = [];
  private totalLength = 0;
  private readonly seed: number;
  private readonly outputFormat: 'hex' | 'bigint';

  constructor(options?: Hash128Options) {
    this.seed = options?.seed ?? 0;
    this.outputFormat = options?.output ?? 'hex';
  }

  /**
   * Add data to the hash
   */
  update(input: HashInput): this {
    const bytes = toBytes(input);
    this.chunks.push(bytes);
    this.totalLength += bytes.length;
    return this;
  }

  /**
   * Compute the final hash
   */
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
 * Create a streaming hasher for MurmurHash3 x86 128-bit
 *
 * @param options - Optional seed and output format
 *
 * @example
 * ```ts
 * const hasher = createHash128();
 * hasher.update('hello');
 * hasher.update(' world');
 * hasher.digest()
 * ```
 */
export function createHash128(options?: Hash128Options): Hash128Stream {
  return new Hash128Stream(options);
}
