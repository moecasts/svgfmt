import {
	exportJSONPackage as exportJSONPackageFromTools,
	type IconSet,
} from '@iconify/tools';
import type { ExportJSONPackageOptions } from './types';

/**
 * Export IconSet as npm-publishable Iconify JSON package
 *
 * This is a direct wrapper of @iconify/tools' exportJSONPackage,
 * creating a complete npm package structure with package.json and icon data.
 *
 * ## Features
 *
 * - Generates standard npm package structure
 * - Automatically creates package.json
 * - Includes complete icon set data (IconifyJSON format)
 * - Supports adding custom files (README, LICENSE, etc.)
 * - Can be published directly to npm
 *
 * ## Generated package structure
 *
 * ```
 * target-directory/
 * ├── package.json          # npm package configuration
 * ├── icons.json            # Icon set data
 * └── [custom files]        # Files added via customFiles
 * ```
 *
 * ## Using the generated package
 *
 * After publishing, users can use it like this:
 *
 * ```ts
 * import { addCollection } from '@iconify/react';
 * import { icons } from '@iconify-json/my-icons';
 *
 * addCollection(icons);
 * ```
 *
 * @param iconSet - Icon set instance to export
 * @param options - Export options
 * @returns Promise<string[]> - List of generated files
 *
 * @example
 * // Basic usage
 * await exportJSONPackage(iconSet, {
 *   target: './dist/npm-package',
 *   package: {
 *     name: '@iconify-json/my-icons',
 *     version: '1.0.0',
 *   },
 * });
 *
 * @example
 * // Full configuration
 * const files = await exportJSONPackage(iconSet, {
 *   target: './packages/my-icons',
 *   cleanup: true,
 *   package: {
 *     name: '@iconify-json/my-icons',
 *     version: '1.0.0',
 *     description: 'My custom icon set',
 *     author: {
 *       name: 'Your Name',
 *       email: 'you@example.com',
 *       url: 'https://yoursite.com',
 *     },
 *     license: 'MIT',
 *     homepage: 'https://github.com/yourname/my-icons',
 *     repository: {
 *       type: 'git',
 *       url: 'https://github.com/yourname/my-icons.git',
 *     },
 *     keywords: ['icons', 'iconify', 'svg'],
 *   },
 *   customFiles: {
 *     'README.md': '# My Icons\n\nCustom icon collection for Iconify.',
 *     'LICENSE': 'MIT License\n\nCopyright (c) 2024...',
 *   },
 * });
 * console.log(`Generated ${files.length} files`);
 *
 * @example
 * // Use with importDirectory
 * const iconSet = await importDirectory('./icons', {
 *   prefix: 'brand',
 *   info: {
 *     name: 'Brand Icons',
 *     author: { name: 'Your Company' },
 *     license: { title: 'MIT' },
 *   },
 * });
 *
 * await exportJSONPackage(iconSet, {
 *   target: './dist/iconify-json-brand',
 *   cleanup: true,
 *   package: {
 *     name: '@iconify-json/brand',
 *     version: '1.0.0',
 *   },
 * });
 *
 * @example
 * // Publishing to npm
 * // 1. Export package
 * await exportJSONPackage(iconSet, {
 *   target: './dist/package',
 *   package: { name: '@iconify-json/my-icons', version: '1.0.0' },
 * });
 * // 2. Publish (run in terminal)
 * // cd dist/package && npm publish
 *
 * @see {@link https://iconify.design/docs/libraries/tools/export/json-package.html}
 */
export async function exportJSONPackage(
	iconSet: IconSet,
	options: ExportJSONPackageOptions,
): Promise<string[]> {
	// Directly use @iconify/tools' exportJSONPackage
	// This ensures generated packages are fully compatible with Iconify ecosystem
	return await exportJSONPackageFromTools(iconSet, options);
}
