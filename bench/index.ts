import { hash32, hash128, hash128x64 } from '../src/index.ts';

interface BenchResult {
  name: string;
  opsPerSec: number;
  avgTime: string;
}

function bench(name: string, fn: () => void, iterations = 100000): BenchResult {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    fn();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const elapsed = performance.now() - start;

  const opsPerSec = Math.round((iterations / elapsed) * 1000);
  const avgTime = (elapsed / iterations * 1000).toFixed(3) + 'μs';

  return { name, opsPerSec, avgTime };
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

console.log('murmur-hash v2.0.0 Benchmark\n');
console.log('Running benchmarks...\n');

// Test data
const shortStr = 'hello';
const mediumStr = 'The quick brown fox jumps over the lazy dog';
const longStr = mediumStr.repeat(100);
const bytes = new Uint8Array(1024).fill(42);

const results: BenchResult[] = [];

// hash32 benchmarks
results.push(bench('hash32 (short string)', () => hash32(shortStr)));
results.push(bench('hash32 (medium string)', () => hash32(mediumStr)));
results.push(bench('hash32 (long string)', () => hash32(longStr), 10000));
results.push(bench('hash32 (1KB bytes)', () => hash32(bytes), 10000));

// hash128 benchmarks
results.push(bench('hash128 (short string)', () => hash128(shortStr)));
results.push(bench('hash128 (medium string)', () => hash128(mediumStr)));
results.push(bench('hash128 (long string)', () => hash128(longStr), 10000));
results.push(bench('hash128 (1KB bytes)', () => hash128(bytes), 10000));

// hash128x64 benchmarks
results.push(bench('hash128x64 (short string)', () => hash128x64(shortStr)));
results.push(bench('hash128x64 (medium string)', () => hash128x64(mediumStr)));
results.push(bench('hash128x64 (long string)', () => hash128x64(longStr), 10000));
results.push(bench('hash128x64 (1KB bytes)', () => hash128x64(bytes), 10000));

// Print results
console.log('Results:\n');
console.log('Function                      | ops/sec      | avg time');
console.log('-'.repeat(60));

for (const r of results) {
  const name = r.name.padEnd(30);
  const ops = formatNumber(r.opsPerSec).padStart(12);
  console.log(`${name}| ${ops} | ${r.avgTime}`);
}

console.log('\nNote: Higher ops/sec is better. Lower avg time is better.');
