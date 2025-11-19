import type { HashInput } from './types.js';

const encoder = new TextEncoder();

/**
 * Convert string or Uint8Array to Uint8Array
 */
export function toBytes(input: HashInput): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  return encoder.encode(input);
}

/**
 * Convert hex string to BigInt
 */
export function hexToBigInt(hex: string): bigint {
  return BigInt('0x' + hex);
}
