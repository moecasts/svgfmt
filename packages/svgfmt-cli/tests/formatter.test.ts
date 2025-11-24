import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { format } from '@svgfmt/core';
import { temporaryDirectory, temporaryFile } from 'tempy';
import { formatPattern } from '../src/formatter';

describe('formatPattern', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  test('should format single-color SVG correctly', async () => {
    const fixtureFile = path.join(fixturesDir, 'single-color.svg');

    // Read and format directly using core format function
    const input = await fs.readFile(fixtureFile, 'utf-8');
    const formatted = await format(input);

    // Verify formatted content matches snapshot
    await expect(formatted).toMatchFileSnapshot(
      './snapshots/formatter-single-color.svg',
    );

    // Verify currentColor conversion
    expect(formatted).not.toContain('red');
    expect(formatted).toContain('<svg');
  });

  test('should format multi-color SVG correctly', async () => {
    const fixtureFile = path.join(fixturesDir, 'multi-color.svg');

    // Read and format directly
    const input = await fs.readFile(fixtureFile, 'utf-8');
    const formatted = await format(input);

    // Verify formatted content matches snapshot
    await expect(formatted).toMatchFileSnapshot(
      './snapshots/formatter-multi-color.svg',
    );
  });

  test('should format multiple files with glob pattern', async () => {
    // Create temp directory and copy fixtures
    const tempDir = temporaryDirectory();
    await fs.copyFile(
      path.join(fixturesDir, 'single-color.svg'),
      path.join(tempDir, 'single-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'multi-color.svg'),
      path.join(tempDir, 'multi-color.svg'),
    );

    // Match only valid SVG files in temp directory
    const pattern = path.join(tempDir, '{single,multi}-color.svg');
    const summary = await formatPattern(pattern);

    expect(summary.total).toBe(2);
    expect(summary.success).toBe(2);
    expect(summary.failed).toBe(0);

    // Verify all files were formatted
    for (const result of summary.results) {
      expect(result.success).toBe(true);
      // Files are formatted in place, so we check the input path
      const content = await fs.readFile(result.input, 'utf-8');
      expect(content).toContain('<svg');
    }
  });

  test('should handle invalid SVG file gracefully', async () => {
    // Copy invalid fixture to temp file
    const tempFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'invalid.svg'), tempFile);

    const summary = await formatPattern(tempFile);

    expect(summary.total).toBe(1);
    expect(summary.success).toBe(0);
    expect(summary.failed).toBe(1);

    const result = summary.results[0];
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid SVG file');
  });

  test('should throw error when no files match pattern', async () => {
    const pattern = '/nonexistent/path/**/*.svg';

    await expect(formatPattern(pattern)).rejects.toThrow(
      'No files found matching pattern',
    );
  });

  test('should handle nested directory structures', async () => {
    // Create temp directory with nested structure
    const tempDir = temporaryDirectory();
    const nestedDir = path.join(tempDir, 'nested');
    await fs.mkdir(nestedDir);

    // Copy fixtures to nested structure
    await fs.copyFile(
      path.join(fixturesDir, 'single-color.svg'),
      path.join(tempDir, 'single-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'multi-color.svg'),
      path.join(nestedDir, 'multi-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'invalid.svg'),
      path.join(tempDir, 'invalid.svg'),
    );

    const pattern = path.join(tempDir, '**/*.svg');
    const summary = await formatPattern(pattern);

    // Should find at least single-color.svg, multi-color.svg, and invalid.svg
    expect(summary.total).toBeGreaterThanOrEqual(2);

    // Valid SVGs should be formatted successfully
    const validResults = summary.results.filter((r) => r.success);
    expect(validResults.length).toBeGreaterThanOrEqual(2);
  });

  test('should report summary with correct counts', async () => {
    // Create temp directory and copy all fixtures
    const tempDir = temporaryDirectory();
    await fs.copyFile(
      path.join(fixturesDir, 'single-color.svg'),
      path.join(tempDir, 'single-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'multi-color.svg'),
      path.join(tempDir, 'multi-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'invalid.svg'),
      path.join(tempDir, 'invalid.svg'),
    );

    // Test with all files including invalid one
    const pattern = path.join(tempDir, '*.svg');
    const summary = await formatPattern(pattern);

    // Verify summary structure
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.success + summary.failed).toBe(summary.total);
    expect(summary.results).toHaveLength(summary.total);

    // Verify each result has required fields
    for (const result of summary.results) {
      expect(result).toHaveProperty('input');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('success');
      if (!result.success) {
        expect(result).toHaveProperty('error');
      }
    }
  });
});
