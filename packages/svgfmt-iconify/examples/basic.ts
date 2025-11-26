/**
 * Basic example: Import SVG and export as JSON package
 *
 * Run: tsx examples/basic.ts
 */

import { importDirectory, exportJSONPackage } from '../src';

async function main() {
	// 1. Import SVG files from directory
	console.log('📦 Importing SVG files...');
	const iconSet = await importDirectory('../tests/fixtures', {
		prefix: 'example',
		format: {
			// @svgfmt/core will automatically process SVG
		},
		info: {
			name: 'Example Icons',
			author: {
				name: 'Demo User',
			},
			license: {
				title: 'MIT',
			},
		},
	});

	console.log(`✅ Successfully imported ${iconSet.count()} icons`);
	console.log(`Icon list: ${iconSet.list().join(', ')}`);

	// 2. Export as JSON package
	console.log('\n📦 Exporting JSON package...');
	const files = await exportJSONPackage(iconSet, {
		target: './output/iconify-json-example',
		cleanup: true,
		package: {
			name: '@iconify-json/example',
			version: '1.0.0',
			description: 'Example icon collection',
			license: 'MIT',
		},
		customFiles: {
			'README.md': '# Example Icons\n\nThis is a demo icon set.',
		},
	});

	console.log(`✅ Successfully generated ${files.length} files`);
	console.log('Output directory: ./output/iconify-json-example');
}

main().catch(console.error);
