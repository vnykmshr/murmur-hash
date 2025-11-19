import { test } from 'node:test';
import assert from 'node:assert';
import { hash128, createHash128 } from '../src/hash128.ts';

// Reference test vectors for x86 128-bit
const testVectors: Array<{ input: string; seed?: number; expected: string }> = [
  { input: 'I will not buy this record, it is scratched.', expected: 'a0a9683b25ac5e40d9af2895890dddf5' },
  { input: '', expected: '00000000000000000000000000000000' },
  { input: '0', expected: '0ab2409ea5eb34f8a5eb34f8a5eb34f8' },
  { input: '01', expected: '0f87acb4674f3b21674f3b21674f3b21' },
  { input: '012', expected: 'cd94fea54c13d78e4c13d78e4c13d78e' },
  { input: '0123', expected: 'dc378fea485d3536485d3536485d3536' },
  { input: '01234', expected: '35c5b3ee7b3b211600ae108800ae1088' },
  { input: '0123456', expected: 'b708d0a186d15c02495d053b495d053b' },
  { input: '01234567', expected: 'aa22bf849216040263b83c5e63b83c5e' },
  { input: '012345678', expected: '571b5f6775d48126d0205c304ca675dc' },
  { input: '0123456789', expected: '0017a61e2e528b33a5443f2057a11235' },
  { input: '0123456789a', expected: '38a2ed0f921f15e42caa7f97a971884f' },
  { input: '0123456789ab', expected: 'cfaa93f9b6982a7e53412b5d04d3d08f' },
  { input: '0123456789abc', expected: 'c970af1dcc6d9d01dd00c683fc11eee3' },
  { input: '0123456789abcd', expected: '6f34d20ac0a5114dae0d83c563f51794' },
  { input: '0123456789abcde', expected: '3c76c46d4d0818c0add433daa78673fa' },
  { input: '0123456789abcdef', expected: 'fb7d440936aed30a48ad1d9b572b3bfd' },
  { input: '', seed: 1, expected: '88c4adec54d201b954d201b954d201b9' },
];

test('hash128: reference test vectors', () => {
  for (const { input, seed, expected } of testVectors) {
    const result = hash128(input, seed !== undefined ? { seed } : undefined);
    assert.strictEqual(
      result,
      expected,
      `hash128("${input}", ${seed ?? 0}) = ${result}, expected ${expected}`
    );
  }
});

test('hash128: Uint8Array input', () => {
  const str = 'hello';
  const bytes = new TextEncoder().encode(str);
  assert.strictEqual(hash128(bytes), hash128(str));
});

test('hash128: BigInt output', () => {
  const hex = hash128('test') as string;
  const bigint = hash128('test', { output: 'bigint' }) as bigint;

  assert.strictEqual(typeof bigint, 'bigint');
  assert.strictEqual(bigint, BigInt('0x' + hex));
});

test('hash128: different seeds produce different hashes', () => {
  const h1 = hash128('test', { seed: 0 });
  const h2 = hash128('test', { seed: 1 });
  assert.notStrictEqual(h1, h2);
});

test('hash128: returns 32 character hex string', () => {
  const result = hash128('test') as string;
  assert.strictEqual(result.length, 32);
  assert.ok(/^[0-9a-f]{32}$/.test(result));
});

test('createHash128: streaming produces same result as one-shot', () => {
  const input = 'hello world';
  const oneShot = hash128(input);

  const streamed = createHash128();
  streamed.update('hello');
  streamed.update(' ');
  streamed.update('world');

  assert.strictEqual(streamed.digest(), oneShot);
});

test('createHash128: streaming with BigInt output', () => {
  const oneShot = hash128('test', { output: 'bigint' });

  const streamed = createHash128({ output: 'bigint' });
  streamed.update('test');

  assert.strictEqual(streamed.digest(), oneShot);
});

test('createHash128: with seed', () => {
  const input = 'hello';
  const seed = 42;
  const oneShot = hash128(input, { seed });

  const streamed = createHash128({ seed });
  streamed.update(input);

  assert.strictEqual(streamed.digest(), oneShot);
});
