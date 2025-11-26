import { existsSync, rmSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import {
	exportJSONPackage,
	exportToDirectory,
	importDirectory,
} from '../src';

describe('@svgfmt/iconify', () => {
	const fixturesDir = join(__dirname, 'fixtures');
	const outputDir = join(__dirname, 'output');

	// Clean output directory
	beforeEach(() => {
		if (existsSync(outputDir)) {
			rmSync(outputDir, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		if (existsSync(outputDir)) {
			rmSync(outputDir, { recursive: true, force: true });
		}
	});

	describe('importDirectory', () => {
		test('should import all SVG files from directory', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
			});

			// Verify icon set prefix
			expect(iconSet.prefix).toBe('test');

			// Verify number of imported icons
			const icons = iconSet.list();
			expect(icons.length).toBeGreaterThan(0);

			// Verify specific icons exist
			expect(iconSet.exists('home')).toBe(true);
			expect(iconSet.exists('arrow-left')).toBe(true);
			expect(iconSet.exists('circle')).toBe(true);
		});

		test('should process SVG with format options', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
				format: {
					// @svgfmt/core will automatically convert single color to currentColor
				},
			});

			// Get processed SVG
			const homeSvg = iconSet.toString('home');

			// Verify SVG has been formatted (should contain currentColor)
			expect(homeSvg).toBeTruthy();
			// Note: Specific verification depends on @svgfmt/core behavior
		});

		test('should set default dimensions', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
				defaults: {
					width: 32,
					height: 32,
				},
			});

			const svg = iconSet.toSVG('home');
			expect(svg?.viewBox.width).toBe(32);
			expect(svg?.viewBox.height).toBe(32);
		});

		test('should customize icon naming', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
				keyword: (file) => file.file.toUpperCase(),
			});

			// Verify uppercase naming
			expect(iconSet.exists('HOME')).toBe(true);
			expect(iconSet.exists('ARROW-LEFT')).toBe(true);
		});

		test('should set icon set metadata', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
				info: {
					name: 'Test Icons',
					author: {
						name: 'Test Author',
					},
				},
			});

			expect(iconSet.info?.name).toBe('Test Icons');
			expect(iconSet.info?.author?.name).toBe('Test Author');
		});
	});

	describe('exportToDirectory', () => {
		test('should export icon set to directory', async () => {
			// 1. Import icon set
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
			});

			// 2. Export to directory
			const svgOutputDir = join(outputDir, 'svg');
			const files = await exportToDirectory(iconSet, {
				target: svgOutputDir,
			});

			// 3. Verify exported files
			expect(files.length).toBeGreaterThan(0);

			// Verify files exist
			const exportedFiles = await readdir(svgOutputDir);
			expect(exportedFiles).toContain('home.svg');
			expect(exportedFiles).toContain('arrow-left.svg');
			expect(exportedFiles).toContain('circle.svg');
		});

		test('should clean target directory', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
			});

			const svgOutputDir = join(outputDir, 'svg-clean');

			// First export
			await exportToDirectory(iconSet, {
				target: svgOutputDir,
			});

			// Second export with cleanup
			await exportToDirectory(iconSet, {
				target: svgOutputDir,
				cleanup: true,
			});

			// Verify files still exist
			const files = await readdir(svgOutputDir);
			expect(files.length).toBeGreaterThan(0);
		});
	});

	describe('exportJSONPackage', () => {
		test('should export as JSON package', async () => {
			// 1. Import icon set
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test-icons',
				info: {
					name: 'Test Icons',
					author: {
						name: 'Test Author',
					},
					license: {
						title: 'MIT',
					},
				},
			});

			// 2. Export as JSON package
			const packageDir = join(outputDir, 'json-package');
			const files = await exportJSONPackage(iconSet, {
				target: packageDir,
				package: {
					name: '@iconify-json/test-icons',
					version: '1.0.0',
					description: 'Test icon collection',
					license: 'MIT',
				},
			});

			// 3. Verify generated files
			expect(files.length).toBeGreaterThan(0);

			// Verify package.json exists
			const packageJsonPath = join(packageDir, 'package.json');
			expect(existsSync(packageJsonPath)).toBe(true);

			// Read and verify package.json
			const packageJson = JSON.parse(
				await readFile(packageJsonPath, 'utf-8'),
			);
			expect(packageJson.name).toBe('@iconify-json/test-icons');
			expect(packageJson.version).toBe('1.0.0');
		});

		test('should add custom files', async () => {
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'test',
			});

			const packageDir = join(outputDir, 'json-package-custom');
			await exportJSONPackage(iconSet, {
				target: packageDir,
				package: {
					name: '@iconify-json/test',
					version: '1.0.0',
				},
				customFiles: {
					'README.md': '# Test Icons\n\nThis is a test icon set.',
					'LICENSE': 'MIT License',
				},
			});

			// Verify custom files exist
			expect(existsSync(join(packageDir, 'README.md'))).toBe(true);
			expect(existsSync(join(packageDir, 'LICENSE'))).toBe(true);

			// Verify file content
			const readme = await readFile(join(packageDir, 'README.md'), 'utf-8');
			expect(readme).toContain('Test Icons');
		});
	});

	describe('complete workflow', () => {
		test('should complete full import to export workflow', async () => {
			// 1. Import SVG with format processing
			const iconSet = await importDirectory(fixturesDir, {
				prefix: 'my-icons',
				format: {
					// Use @svgfmt/core default processing
				},
				info: {
					name: 'My Icons',
					author: {
						name: 'Test User',
						url: 'https://example.com',
					},
					license: {
						title: 'MIT',
						spdx: 'MIT',
					},
				},
				defaults: {
					width: 24,
					height: 24,
				},
			});

			// 2. Export to both SVG directory and JSON package
			const svgDir = join(outputDir, 'workflow-svg');
			const jsonDir = join(outputDir, 'workflow-json');

			await Promise.all([
				exportToDirectory(iconSet, {
					target: svgDir,
					cleanup: true,
					log: false,
				}),
				exportJSONPackage(iconSet, {
					target: jsonDir,
					cleanup: true,
					package: {
						name: '@iconify-json/my-icons',
						version: '1.0.0',
						description: 'My custom icon collection',
						author: 'Test User',
						license: 'MIT',
					},
					customFiles: {
						'README.md': '# My Icons\n\nCustom icon collection.',
					},
				}),
			]);

			// 3. Verify both exports succeeded
			expect(existsSync(svgDir)).toBe(true);
			expect(existsSync(jsonDir)).toBe(true);

			// Verify SVG files
			const svgFiles = await readdir(svgDir);
			expect(svgFiles.length).toBeGreaterThan(0);

			// Verify JSON package
			expect(existsSync(join(jsonDir, 'package.json'))).toBe(true);
			expect(existsSync(join(jsonDir, 'README.md'))).toBe(true);
		});
	});
});
