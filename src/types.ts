/**
 * Output format for 128-bit hash functions
 */
export type HashOutput = 'hex' | 'bigint';

/**
 * Options for 128-bit hash functions
 */
export interface Hash128Options {
  /** Seed value (default: 0) */
  seed?: number;
  /** Output format (default: 'hex') */
  output?: HashOutput;
}

/**
 * Input type for hash functions
 */
export type HashInput = string | Uint8Array;
