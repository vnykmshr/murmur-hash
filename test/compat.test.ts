import { test } from 'node:test';
import assert from 'node:assert';
import { v3, hash32, hash128, hash128x64 } from '../src/index.ts';

test('v1 compat: v3.x86.hash32 matches hash32', () => {
  const input = 'test';
  const seed = 42;
  assert.strictEqual(v3.x86.hash32(input, seed), hash32(input, seed));
});

test('v1 compat: v3.x86.hash128 matches hash128', () => {
  const input = 'test';
  const seed = 42;
  assert.strictEqual(v3.x86.hash128(input, seed), hash128(input, { seed }));
});

test('v1 compat: v3.x64.hash128 matches hash128x64', () => {
  const input = 'test';
  const seed = 42;
  assert.strictEqual(v3.x64.hash128(input, seed), hash128x64(input, { seed }));
});
