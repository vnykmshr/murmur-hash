import { test } from 'node:test';
import assert from 'node:assert';
import { hash32, createHash32 } from '../src/hash32.ts';

// Reference test vectors from MurmurHash3 specification
const testVectors: Array<{ input: string; seed?: number; expected: number }> = [
  { input: 'I will not buy this record, it is scratched.', expected: 2832214938 },
  { input: '', expected: 0 },
  { input: '0', expected: 3530670207 },
  { input: '01', expected: 1642882560 },
  { input: '012', expected: 3966566284 },
  { input: '0123', expected: 3558446240 },
  { input: '01234', expected: 433070448 },
  { input: '0123456', expected: 183447976 },
  { input: '01234567', expected: 1451431763 },
  { input: '012345678', expected: 1350687357 },
  { input: '0123456789', expected: 1891213601 },
  { input: '0123456789a', expected: 3564907726 },
  { input: '0123456789ab', expected: 2044149191 },
  { input: '0123456789abc', expected: 4193546897 },
  { input: '0123456789abcd', expected: 439890777 },
  { input: '0123456789abcde', expected: 2250527230 },
  { input: '0123456789abcdef', expected: 919068895 },
  { input: '', seed: 1, expected: 1364076727 },
];

test('hash32: reference test vectors', () => {
  for (const { input, seed, expected } of testVectors) {
    const result = hash32(input, seed);
    assert.strictEqual(
      result,
      expected,
      `hash32("${input}", ${seed ?? 0}) = ${result}, expected ${expected}`
    );
  }
});

test('hash32: Uint8Array input', () => {
  const str = 'hello';
  const bytes = new TextEncoder().encode(str);
  assert.strictEqual(hash32(bytes), hash32(str));
});

test('hash32: returns unsigned 32-bit integer', () => {
  const result = hash32('test');
  assert.ok(result >= 0, 'Result should be non-negative');
  assert.ok(result <= 0xffffffff, 'Result should be <= 2^32 - 1');
});

test('createHash32: streaming produces same result as one-shot', () => {
  const input = 'hello world';
  const oneShot = hash32(input);

  const streamed = createHash32();
  streamed.update('hello');
  streamed.update(' ');
  streamed.update('world');

  assert.strictEqual(streamed.digest(), oneShot);
});

test('createHash32: with seed', () => {
  const input = 'hello';
  const seed = 42;
  const oneShot = hash32(input, seed);

  const streamed = createHash32(seed);
  streamed.update(input);

  assert.strictEqual(streamed.digest(), oneShot);
});
