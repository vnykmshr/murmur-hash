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

test('v1 compat: default seed is 0', () => {
  const input = 'hello';
  assert.strictEqual(v3.x86.hash32(input), hash32(input, 0));
  assert.strictEqual(v3.x86.hash128(input), hash128(input, { seed: 0 }));
  assert.strictEqual(v3.x64.hash128(input), hash128x64(input, { seed: 0 }));
});

test('exports: all main functions are exported', () => {
  assert.strictEqual(typeof hash32, 'function');
  assert.strictEqual(typeof hash128, 'function');
  assert.strictEqual(typeof hash128x64, 'function');
});

test('exports: v3 compat is exported', () => {
  assert.strictEqual(typeof v3, 'object');
  assert.strictEqual(typeof v3.x86.hash32, 'function');
  assert.strictEqual(typeof v3.x86.hash128, 'function');
  assert.strictEqual(typeof v3.x64.hash128, 'function');
});
