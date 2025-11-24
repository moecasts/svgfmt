import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from '@rstest/core';
import { execa } from 'execa';
import { temporaryDirectory, temporaryFile } from 'tempy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CLI integration tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const cliPath = path.join(__dirname, '../dist/cli.js');

  test('should display version', async () => {
    const { stdout } = await execa('node', [cliPath, '--version']);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  test('should display help', async () => {
    const { stdout } = await execa('node', [cliPath, '--help']);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Options:');
    expect(stdout).toContain('-o, --output');
    expect(stdout).toContain('pattern');
  });

  test('should format a single file in place', async () => {
    // Copy fixture to temp file
    const tempFile = temporaryFile({ extension: 'svg' });
    const fixtureFile = path.join(fixturesDir, 'single-color.svg');
    await fs.copyFile(fixtureFile, tempFile);

    const { stdout } = await execa('node', [cliPath, tempFile]);

    expect(stdout).toContain('Formatting SVG files matching');
    expect(stdout).toContain('Formatted 1/1 files');
    expect(stdout).toContain('Files formatted in place');
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

    // Use glob pattern to match multiple files
    const pattern = path.join(tempDir, '{single,multi}-color.svg');
    const { stdout } = await execa('node', [cliPath, pattern]);

    expect(stdout).toContain('Formatted 2/2 files');
  });

  test('should exit with error when no files match', async () => {
    const pattern = '/nonexistent/path/*.svg';

    await expect(execa('node', [cliPath, pattern])).rejects.toThrow();
  });

  test('should report errors for invalid SVG files', async () => {
    // Copy invalid fixture to temp file
    const tempFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'invalid.svg'), tempFile);

    const result = await execa('node', [cliPath, tempFile]).catch(
      (error) => error,
    );

    // CLI should exit with error
    expect(result.exitCode).toBe(1);
    expect(result.stderr || result.stdout).toContain('Invalid SVG file');
  });

  test('should handle nested directories with glob pattern', async () => {
    // Create temp directory with nested structure
    const tempDir = temporaryDirectory();
    const nestedDir = path.join(tempDir, 'nested');
    await fs.mkdir(nestedDir);

    await fs.copyFile(
      path.join(fixturesDir, 'single-color.svg'),
      path.join(tempDir, 'single-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'multi-color.svg'),
      path.join(nestedDir, 'multi-color.svg'),
    );

    // Use recursive glob pattern
    const pattern = path.join(tempDir, '**/{single,multi}-color.svg');
    const { stdout } = await execa('node', [cliPath, pattern]);

    expect(stdout).toContain('Formatted 2/2 files');
  });

  test('should show error summary for mixed results', async () => {
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

    // Format all files including invalid one
    const pattern = path.join(tempDir, '*.svg');

    const result = await execa('node', [cliPath, pattern]).catch(
      (error) => error,
    );

    // Should exit with error due to invalid file
    expect(result.exitCode).toBe(1);

    // Should show both success and failure counts
    // Output goes to both stdout and stderr
    const output = (result.stdout || '') + (result.stderr || '');
    expect(output).toContain('Formatted 2/3 files');
    expect(output).toContain('Failed to format 1 files');
    expect(output).toContain('Invalid SVG file');
  });
});

describe('CLI transform option tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const transformsDir = path.join(fixturesDir, 'transforms');
  const cliPath = path.join(__dirname, '../dist/cli.js');

  test('should apply transform from file path', async () => {
    const tempFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'single-color.svg'), tempFile);

    const transformPath = path.join(transformsDir, 'add-class.js');
    const { stdout } = await execa('node', [
      cliPath,
      tempFile,
      '--transform',
      transformPath,
    ]);

    expect(stdout).toContain('Formatted 1/1 files');

    // Verify transform was applied
    const content = await fs.readFile(tempFile, 'utf-8');
    expect(content).toContain('class="custom-icon"');
  });

  test('should apply transform from inline code', async () => {
    const tempFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'single-color.svg'), tempFile);

    const inlineCode = 'svg => svg.replace(/<svg/, \'<svg data-cli="test"\')';
    const { stdout } = await execa('node', [
      cliPath,
      tempFile,
      '-t',
      inlineCode,
    ]);

    expect(stdout).toContain('Formatted 1/1 files');

    // Verify transform was applied
    const content = await fs.readFile(tempFile, 'utf-8');
    expect(content).toContain('data-cli="test"');
  });

  test('should apply transform to multiple files', async () => {
    const tempDir = temporaryDirectory();
    await fs.copyFile(
      path.join(fixturesDir, 'single-color.svg'),
      path.join(tempDir, 'single-color.svg'),
    );
    await fs.copyFile(
      path.join(fixturesDir, 'multi-color.svg'),
      path.join(tempDir, 'multi-color.svg'),
    );

    const pattern = path.join(tempDir, '*.svg');
    const transformPath = path.join(transformsDir, 'add-data-attr.js');

    const { stdout } = await execa('node', [
      cliPath,
      pattern,
      '--transform',
      transformPath,
    ]);

    expect(stdout).toContain('Formatted 2/2 files');

    // Verify transform was applied to all files
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      const content = await fs.readFile(path.join(tempDir, file), 'utf-8');
      expect(content).toContain('data-transformed="true"');
    }
  });

  test('should show help including transform option', async () => {
    const { stdout } = await execa('node', [cliPath, '--help']);
    expect(stdout).toContain('-t, --transform');
    expect(stdout).toContain('Transform function');
  });

  test('should handle invalid transform file gracefully', async () => {
    const tempFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'single-color.svg'), tempFile);

    const transformPath = path.join(transformsDir, 'invalid.js');

    const result = await execa('node', [
      cliPath,
      tempFile,
      '--transform',
      transformPath,
    ]).catch((error) => error);

    expect(result.exitCode).toBe(1);
    const output = (result.stdout || '') + (result.stderr || '');
    expect(output).toContain('Transform file must export');
  });

  test('should combine transform with output option', async () => {
    const tempFile = temporaryFile({ extension: 'svg' });
    const outputFile = temporaryFile({ extension: 'svg' });
    await fs.copyFile(path.join(fixturesDir, 'single-color.svg'), tempFile);

    const inlineCode =
      'svg => svg.replace(/<svg/, \'<svg data-output="test"\')';

    await execa('node', [
      cliPath,
      tempFile,
      '-o',
      outputFile,
      '-t',
      inlineCode,
    ]);

    // Original file should be unchanged
    const originalContent = await fs.readFile(tempFile, 'utf-8');
    expect(originalContent).not.toContain('data-output="test"');

    // Output file should have transform applied
    const outputContent = await fs.readFile(outputFile, 'utf-8');
    expect(outputContent).toContain('data-output="test"');
  });
});
