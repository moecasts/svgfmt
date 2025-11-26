import type { IconSet } from '@iconify/tools';
import type { ImportDirectoryFileEntry } from '@iconify/tools/lib/import/directory';
import type { FormatOptions } from '@svgfmt/core';
import type { IconifyInfo } from '@iconify/types';

/**
 * Options for importing directory
 *
 * Extends @iconify/tools importDirectory options with
 * @svgfmt/core format processing capability
 */
export interface ImportDirectoryOptions {
	/**
	 * Icon set prefix
	 *
	 * @example 'my-icons'
	 */
	prefix: string;

	/**
	 * Scan subdirectories
	 *
	 * @default true
	 */
	includeSubDirs?: boolean;

	/**
	 * Icon naming callback function
	 *
	 * Customize icon name generation logic
	 *
	 * @param file - File information (path, subdirectory, filename, etc.)
	 * @param defaultKeyword - Default generated keyword (based on filename)
	 * @param iconSet - Icon set instance
	 * @returns Icon name, return undefined to skip this file
	 *
	 * @example
	 * keyword: (file) => file.file.toLowerCase().replace(/_/g, '-')
	 */
	keyword?: (
		file: ImportDirectoryFileEntry,
		defaultKeyword: string,
		iconSet: IconSet,
	) => string | undefined | Promise<string | undefined>;

	/**
	 * Ignore import errors
	 *
	 * - false: Strict mode, throw exception on error
	 * - true: Ignore errors, silently skip failed icons
	 * - "warn": Ignore errors but output warning messages
	 *
	 * @default true
	 */
	ignoreImportErrors?: boolean | 'warn';

	/**
	 * Keep <title> tags in SVG
	 *
	 * @default false
	 */
	keepTitles?: boolean;

	/**
	 * SVG format options (from @svgfmt/core)
	 *
	 * Automatically applied to all imported SVG files
	 * Includes: cleanup, optimization, color processing, custom transforms, etc.
	 *
	 * @see {@link https://github.com/your-repo/svgfmt/tree/main/packages/svgfmt-core}
	 */
	format?: FormatOptions;

	/**
	 * Icon set metadata
	 *
	 * Includes name, author, license, etc.
	 */
	info?: IconifyInfo;

	/**
	 * Default icon dimensions
	 *
	 * Applied to all icons without explicit dimensions
	 */
	defaults?: {
		/** Default width */
		width?: number;
		/** Default height */
		height?: number;
	};
}

/**
 * Options for exporting to directory
 *
 * Export IconSet as individual SVG files
 */
export interface ExportToDirectoryOptions {
	/**
	 * Target directory path
	 *
	 * Directory will be created automatically if it doesn't exist
	 */
	target: string;

	/**
	 * Clean target directory before export
	 *
	 * @default false
	 * @warning Setting to true will delete all files in target directory
	 */
	cleanup?: boolean;

	/**
	 * Auto-set height
	 *
	 * - true: Icon dimensions match viewBox
	 * - false: Height set to "1em"
	 *
	 * @default true
	 */
	autoHeight?: boolean;

	/**
	 * Generate separate files for aliases
	 *
	 * @default true
	 */
	includeAliases?: boolean;

	/**
	 * Generate files for character mappings
	 *
	 * For example: generate f00.svg for character "f00"
	 *
	 * @default false
	 */
	includeChars?: boolean;

	/**
	 * Enable logging during export
	 *
	 * @default false
	 */
	log?: boolean;
}

/**
 * Options for exporting JSON package
 *
 * Create npm-publishable Iconify icon set package
 */
export interface ExportJSONPackageOptions {
	/**
	 * Target directory path
	 *
	 * Output directory for npm package, will contain package.json and icon data
	 */
	target: string;

	/**
	 * Clean target directory before export
	 *
	 * @default false
	 * @warning Setting to true will delete all files in target directory
	 */
	cleanup?: boolean;

	/**
	 * package.json configuration
	 *
	 * Define npm package metadata
	 */
	package: {
		/** Package name, recommended format: @iconify-json/prefix */
		name: string;
		/** Package version */
		version: string;
		/** Package description */
		description?: string;
		/** Author information */
		author?: string | { name: string; email?: string; url?: string };
		/** License */
		license?: string;
		/** Bug tracker URL */
		bugs?: string | { url: string };
		/** Project homepage */
		homepage?: string;
		/** Code repository */
		repository?: string | { type: string; url: string };
		/** Keywords */
		keywords?: string[];
		/** Other package.json fields */
		[key: string]: unknown;
	};

	/**
	 * Custom files
	 *
	 * Additional files to include in the package
	 *
	 * - Key: Filename
	 * - Value:
	 *   - string: File content
	 *   - Record<string, unknown>: JSON content (will be serialized automatically)
	 *   - null: Delete this file (if exists)
	 *
	 * @example
	 * {
	 *   'README.md': '# My Icons\n\nCustom icon set.',
	 *   'metadata.json': { version: '1.0.0' },
	 *   'unwanted.txt': null
	 * }
	 */
	customFiles?: Record<string, string | Record<string, unknown> | null>;
}
