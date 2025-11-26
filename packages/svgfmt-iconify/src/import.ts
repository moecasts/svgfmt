import {
	importDirectory as importDirectoryFromTools,
	SVG,
	type IconSet,
} from '@iconify/tools';
import { format } from '@svgfmt/core';
import type { ImportDirectoryOptions } from './types';

/**
 * Import SVG files from directory and create IconSet
 *
 * This is an enhanced version of @iconify/tools' importDirectory,
 * automatically processing all imported SVGs using @svgfmt/core's format.
 *
 * ## Workflow
 *
 * 1. Import all SVG files from directory using @iconify/tools
 * 2. Apply @svgfmt/core's format processing to each icon
 * 3. Set default dimensions and metadata
 * 4. Return processed IconSet instance
 *
 * ## Difference from @iconify/tools
 *
 * Standard workflow (@iconify/tools) requires manual processing:
 * ```ts
 * const iconSet = await importDirectory('dir', { prefix: 'test' });
 * iconSet.forEach((name, type) => {
 *   const svg = iconSet.toSVG(name);
 *   cleanupSVG(svg);
 *   parseColors(svg, {...});
 *   runSVGO(svg);
 *   iconSet.fromSVG(name, svg);
 * });
 * ```
 *
 * Using this function (automatic processing):
 * ```ts
 * const iconSet = await importDirectory('dir', {
 *   prefix: 'test',
 *   format: { // All processing configured here }
 * });
 * ```
 *
 * @param dir - Directory path containing SVG files
 * @param options - Import options
 * @returns Promise<IconSet> - Processed icon set instance
 *
 * @example
 * // Basic usage
 * const iconSet = await importDirectory('./icons', {
 *   prefix: 'my-icons',
 * });
 *
 * @example
 * // Full configuration
 * const iconSet = await importDirectory('./icons', {
 *   prefix: 'brand',
 *   includeSubDirs: true,
 *   format: {
 *     transform: (svg) => svg.replace(/fill="[^"]*"/g, 'fill="currentColor"'),
 *   },
 *   info: {
 *     name: 'Brand Icons',
 *     author: { name: 'Your Name' },
 *     license: { title: 'MIT' },
 *   },
 *   defaults: {
 *     width: 24,
 *     height: 24,
 *   },
 *   keyword: (file) => file.file.toLowerCase(),
 * });
 *
 * @see {@link https://iconify.design/docs/libraries/tools/import/directory.html}
 */
export async function importDirectory(
	dir: string,
	options?: ImportDirectoryOptions,
): Promise<IconSet> {
	// 1. Import all SVGs using @iconify/tools' standard importDirectory
	const iconSet = await importDirectoryFromTools(dir, {
		prefix: options?.prefix || '',
		includeSubDirs: options?.includeSubDirs,
		keyword: options?.keyword,
		ignoreImportErrors: options?.ignoreImportErrors,
		keepTitles: options?.keepTitles,
	});

	// 2. Set icon set metadata
	if (options?.info) {
		iconSet.info = options.info;
	}

	// 3. Apply @svgfmt/core's format processing to all icons
	await iconSet.forEach(async (name, type) => {
		// Only process actual icons, skip aliases and variations
		if (type !== 'icon') {
			return;
		}

		// Get icon's SVG instance
		const svg = iconSet.toSVG(name);
		if (!svg) {
			// Invalid icon, remove from icon set
			iconSet.remove(name);
			return;
		}

		try {
			// Key step: Use @svgfmt/core's format to process SVG
			// This automatically handles: cleanup, optimization, color processing, custom transforms, etc.
			const formatted = await format(svg.toString(), options?.format);

			// Create new SVG instance from formatted string
			const newSvg = new SVG(formatted);

			// Apply default dimensions (if configured)
			// Note: SVG class doesn't have direct width/height properties, need to set via viewBox
			if (
				options?.defaults?.width !== undefined ||
				options?.defaults?.height !== undefined
			) {
				newSvg.viewBox = {
					left: newSvg.viewBox.left,
					top: newSvg.viewBox.top,
					width: options?.defaults?.width ?? newSvg.viewBox.width,
					height: options?.defaults?.height ?? newSvg.viewBox.height,
				};
			}

			// Update icon in icon set
			iconSet.fromSVG(name, newSvg);
		} catch (err) {
			// Formatting failed, log error and remove icon from set
			console.error(`Error formatting icon "${name}":`, err);
			iconSet.remove(name);
		}
	});

	return iconSet;
}
