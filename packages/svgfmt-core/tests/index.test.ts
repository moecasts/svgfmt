import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from '@rstest/core';

import { format } from '../src/index';

describe('format', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const solidFixturesDir = path.join(fixturesDir, 'solid');

  // Read all test SVG content
  const singleColorSvgContent = fs.readFileSync(
    path.join(fixturesDir, 'single-color.svg'),
    'utf8',
  );
  const multiColorSvgContent = fs.readFileSync(
    path.join(fixturesDir, 'multi-color.svg'),
    'utf8',
  );
  const opacitySvgContent = fs.readFileSync(
    path.join(fixturesDir, 'with-opacity.svg'),
    'utf8',
  );

  test('should successfully process single-color SVG file and convert it to currentColor', async () => {
    const result = await format(singleColorSvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-single-color.svg',
    );

    // Also verify color conversion
    expect(result).not.toContain('red');
  });

  test('should correctly handle multi-color SVG files', async () => {
    const result = await format(multiColorSvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-multi-color.svg',
    );
  });

  test('should remove opacity-related attributes', async () => {
    const result = await format(opacitySvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-with-opacity.svg',
    );

    // Verify opacity attributes have been removed
    expect(result).not.toContain('fill-opacity');
    expect(result).not.toContain('stroke-opacity');
  });

  test('should correctly apply custom transform function', async () => {
    // Test custom transform function - add custom attribute to svg root element
    const customTransform = (svg: string) =>
      svg.replace(/<svg/, '<svg data-custom-transform="applied"');
    const result = await format(singleColorSvgContent, {
      transform: customTransform,
    });

    // Verify custom transform has been applied
    expect(result).toContain('data-custom-transform="applied"');

    // Save snapshot
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-with-custom-transform.svg',
    );
  });

  test('should batch process all SVG files under the solid folder', async () => {
    // Read all SVG files in the solid folder
    const svgFiles = fs
      .readdirSync(solidFixturesDir)
      .filter((file) => file.endsWith('.svg'));

    // Process all SVG files in parallel
    await Promise.all(
      svgFiles.map(async (svgFile) => {
        const svgContent = fs.readFileSync(
          path.join(solidFixturesDir, svgFile),
          'utf8',
        );
        const result = await format(svgContent);

        await expect(result).toMatchFileSnapshot(
          `./snapshots/solid/${svgFile}`,
        );
      }),
    );
  });
});
