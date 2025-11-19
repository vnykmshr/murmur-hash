import { hash32 } from './hash32.ts';
import { hash128 } from './hash128.ts';
import { hash128x64 } from './hash128x64.ts';

let warned = false;

function warnDeprecation(): void {
  if (warned) return;
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;

  warned = true;
  console.warn(
    '[murmur-hash] The v3.x86/v3.x64 API is deprecated. ' +
      'Use hash32(), hash128(), hash128x64() instead. ' +
      'See https://github.com/vnykmshr/murmur-hash#migration-from-v1'
  );
}

/**
 * v1 compatibility layer (deprecated)
 *
 * @deprecated Use hash32(), hash128(), hash128x64() instead
 */
export const v3 = {
  x86: {
    hash32(key: string, seed?: number): number {
      warnDeprecation();
      return hash32(key, seed);
    },
    hash128(key: string, seed?: number): string {
      warnDeprecation();
      return hash128(key, { seed }) as string;
    },
  },
  x64: {
    hash128(key: string, seed?: number): string {
      warnDeprecation();
      return hash128x64(key, { seed }) as string;
    },
  },
};
