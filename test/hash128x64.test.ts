import { test } from 'node:test';
import assert from 'node:assert';
import { hash128x64, createHash128x64 } from '../src/hash128x64.ts';

// Reference test vectors for x64 128-bit
const testVectors: Array<{ input: string; seed?: number; expected: string }> = [
  { input: 'I will not buy this record, it is scratched.', expected: 'c382657f9a06c49d4a71fdc6d9b0d48f' },
  { input: '', expected: '00000000000000000000000000000000' },
  { input: '0', expected: '2ac9debed546a3803a8de9e53c875e09' },
  { input: '01', expected: '649e4eaa7fc1708ee6945110230f2ad6' },
  { input: '012', expected: 'ce68f60d7c353bdb00364cd5936bf18a' },
  { input: '0123', expected: '0f95757ce7f38254b4c67c9e6f12ab4b' },
  { input: '01234', expected: '0f04e459497f3fc1eccc6223a28dd613' },
  { input: '0123456', expected: '13eb9fb82606f7a6b4ebef492fdef34e' },
  { input: '01234567', expected: '8236039b7387354dc3369387d8964920' },
  { input: '012345678', expected: '4c1e87519fe738ba72a17af899d597f1' },
  { input: '0123456789', expected: '3f9652ac3effeb248027a17cf2990b07' },
  { input: '0123456789a', expected: '4bc3eacd29d386297cb2d9e797da9c92' },
  { input: '0123456789ab', expected: '66352b8cee9e3ca7a9edf0b381a8fc58' },
  { input: '0123456789abc', expected: '5eb2f8db4265931e801ce853e61d0ab7' },
  { input: '0123456789abcd', expected: '07a4a014dd59f71aaaf437854cd22231' },
  { input: '0123456789abcde', expected: 'a62dd5f6c0bf23514fccf50c7c544cf0' },
  { input: '0123456789abcdef', expected: '4be06d94cf4ad1a787c35b5c63a708da' },
  { input: '', seed: 1, expected: '4610abe56eff5cb551622daa78f83583' },
];

test('hash128x64: reference test vectors', () => {
  for (const { input, seed, expected } of testVectors) {
    const result = hash128x64(input, seed !== undefined ? { seed } : undefined);
    assert.strictEqual(
      result,
      expected,
      `hash128x64("${input}", ${seed ?? 0}) = ${result}, expected ${expected}`
    );
  }
});

test('hash128x64: Uint8Array input', () => {
  const str = 'hello';
  const bytes = new TextEncoder().encode(str);
  assert.strictEqual(hash128x64(bytes), hash128x64(str));
});

test('hash128x64: BigInt output', () => {
  const hex = hash128x64('test') as string;
  const bigint = hash128x64('test', { output: 'bigint' }) as bigint;

  assert.strictEqual(typeof bigint, 'bigint');
  assert.strictEqual(bigint, BigInt('0x' + hex));
});

test('hash128x64: different seeds produce different hashes', () => {
  const h1 = hash128x64('test', { seed: 0 });
  const h2 = hash128x64('test', { seed: 1 });
  assert.notStrictEqual(h1, h2);
});

test('hash128x64: returns 32 character hex string', () => {
  const result = hash128x64('test') as string;
  assert.strictEqual(result.length, 32);
  assert.ok(/^[0-9a-f]{32}$/.test(result));
});

test('hash128x64: produces different results than x86', async () => {
  const { hash128 } = await import('../src/hash128.ts');
  const x86Result = hash128('test');
  const x64Result = hash128x64('test');
  assert.notStrictEqual(x86Result, x64Result);
});

test('createHash128x64: streaming produces same result as one-shot', () => {
  const input = 'hello world';
  const oneShot = hash128x64(input);

  const streamed = createHash128x64();
  streamed.update('hello');
  streamed.update(' ');
  streamed.update('world');

  assert.strictEqual(streamed.digest(), oneShot);
});

test('createHash128x64: streaming with BigInt output', () => {
  const oneShot = hash128x64('test', { output: 'bigint' });

  const streamed = createHash128x64({ output: 'bigint' });
  streamed.update('test');

  assert.strictEqual(streamed.digest(), oneShot);
});

test('createHash128x64: with seed', () => {
  const input = 'hello';
  const seed = 42;
  const oneShot = hash128x64(input, { seed });

  const streamed = createHash128x64({ seed });
  streamed.update(input);

  assert.strictEqual(streamed.digest(), oneShot);
});
