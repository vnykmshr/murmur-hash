// Core hash functions
export { hash32, createHash32, Hash32Stream } from './hash32.ts';
export { hash128, createHash128, Hash128Stream } from './hash128.ts';
export { hash128x64, createHash128x64, Hash128x64Stream } from './hash128x64.ts';

// Types
export type { HashInput, HashOutput, Hash128Options } from './types.ts';

// v1 compatibility (deprecated)
export { v3 } from './v1-compat.ts';
