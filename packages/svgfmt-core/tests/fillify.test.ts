import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { fillify } from '../src/fillify';

// Load test SVGs from fixtures
const fixturesDir = join(__dirname, 'fixtures');
const multiPathSvg = readFileSync(join(fixturesDir, 'multi-path.svg'), 'utf8');
const singlePathSvg = readFileSync(
  join(fixturesDir, 'single-path.svg'),
  'utf8',
);
const noFillSvg = readFileSync(join(fixturesDir, 'no-fill.svg'), 'utf8');

describe('fillify', () => {
  test('should merge multiple SVG elements into a single path', async () => {
    const result = await fillify(multiPathSvg);

    // Check that it's still a valid SVG
    await expect(result).toMatchFileSnapshot(
      './snapshots/fillify-multi-path.svg',
    );

    // Check that there's only one path element
    const pathCount = (result.match(/<path/g) || []).length;
    expect(pathCount).toBe(1);

    // Check that stroke is none and fill-rule is evenodd (default)
    expect(result).toContain('stroke="none"');
    expect(result).toContain('fill-rule="evenodd"');
  });

  test('should preserve single path SVG structure', async () => {
    const result = await fillify(singlePathSvg);
    // Check that it's still a valid SVG
    await expect(result).toMatchFileSnapshot(
      './snapshots/fillify-single-path.svg',
    );

    // Check that there's only one path element
    const pathCount = (result.match(/<path/g) || []).length;
    expect(pathCount).toBe(1);

    // Check that fill is preserved or set to appropriate value
    expect(result).toContain('fill="red"');
  });

  test('should work with custom trace resolution', async () => {
    const result = await fillify(multiPathSvg, { traceResolution: 300 });

    // Check that it's still a valid SVG with single path
    expect(result).toMatch(/<svg[\s\S]*>[\s\S]*<\/svg>/);
    expect((result.match(/<path/g) || []).length).toBe(1);

    // Check that it has the same attributes as default resolution (except path data)
    expect(result).toContain('stroke="none"');
    expect(result).toContain('fill-rule="evenodd"');
  });

  test('should handle SVG without explicit fill', async () => {
    const result = await fillify(noFillSvg);

    // Check that it gets default fill
    expect(result).toContain('fill="black"');
  });
});
