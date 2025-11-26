import {
	exportToDirectory as exportToDirectoryFromTools,
	type IconSet,
} from '@iconify/tools';
import type { ExportToDirectoryOptions } from './types';

/**
 * Export IconSet as individual SVG files to specified directory
 *
 * This is a direct wrapper of @iconify/tools' exportToDirectory,
 * maintaining API consistency for easy use with this package's importDirectory.
 *
 * ## Features
 *
 * - Creates individual SVG file for each icon
 * - Automatically creates target directory (if doesn't exist)
 * - Optional target directory cleanup
 * - Supports exporting aliases and character mappings
 * - Customizable icon height settings
 *
 * ## Exported file naming
 *
 * - Regular icons: `icon-name.svg`
 * - Aliases: Exported based on `includeAliases` option
 * - Character mappings: Exported based on `includeChars` option (e.g., `f00.svg`)
 *
 * @param iconSet - Icon set instance to export
 * @param options - Export options
 * @returns Promise<string[]> - List of exported file names
 *
 * @example
 * // Basic usage
 * await exportToDirectory(iconSet, {
 *   target: './dist/svg',
 * });
 *
 * @example
 * // Full configuration
 * const files = await exportToDirectory(iconSet, {
 *   target: './output/icons',
 *   cleanup: true,        // Clean target directory
 *   autoHeight: false,    // Set height to "1em"
 *   includeAliases: true, // Export aliases
 *   includeChars: false,  // Don't export character mappings
 *   log: true,            // Show logs
 * });
 * console.log(`Exported ${files.length} icons`);
 *
 * @example
 * // Use with importDirectory
 * const iconSet = await importDirectory('./icons', {
 *   prefix: 'my-icons',
 * });
 * await exportToDirectory(iconSet, {
 *   target: './dist/svg',
 *   cleanup: true,
 * });
 *
 * @see {@link https://iconify.design/docs/libraries/tools/export/directory.html}
 */
export async function exportToDirectory(
	iconSet: IconSet,
	options: ExportToDirectoryOptions,
): Promise<string[]> {
	// Directly use @iconify/tools' exportToDirectory
	// This ensures full compatibility with standard tools
	return await exportToDirectoryFromTools(iconSet, options);
}
