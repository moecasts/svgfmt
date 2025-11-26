/**
 * Advanced example: Complete icon set build workflow
 *
 * Run: tsx examples/advanced.ts
 */

import {
	importDirectory,
	exportToDirectory,
	exportJSONPackage,
} from '../src';

async function main() {
	console.log('🚀 Starting icon set build...\n');

	// 1. Import and process SVG
	console.log('📦 Step 1: Importing SVG files');
	const iconSet = await importDirectory('../tests/fixtures', {
		prefix: 'brand',
		includeSubDirs: true,
		format: {
			// Custom SVG transformation
			transform: (svg) => {
				// Example: Unify all stroke widths
				return svg.replace(/stroke-width="[^"]*"/g, 'stroke-width="2"');
			},
		},
		info: {
			name: 'Brand Icons',
			author: {
				name: 'Your Company',
				url: 'https://example.com',
			},
			license: {
				title: 'MIT',
				spdx: 'MIT',
			},
			version: '1.0.0',
		},
		defaults: {
			width: 24,
			height: 24,
		},
		// Custom icon naming: lowercase and replace underscores
		keyword: (file) => file.file.toLowerCase().replace(/_/g, '-'),
	});

	console.log(`✅ Successfully imported ${iconSet.count()} icons`);
	console.log(`   Icons: ${iconSet.list().join(', ')}\n`);

	// 2. Export as individual SVG files
	console.log('📦 Step 2: Exporting as SVG files');
	const svgFiles = await exportToDirectory(iconSet, {
		target: './output/svg',
		cleanup: true,
		autoHeight: true,
		includeAliases: true,
		log: false,
	});

	console.log(`✅ Successfully exported ${svgFiles.length} SVG files`);
	console.log(`   Directory: ./output/svg\n`);

	// 3. Export as npm package
	console.log('📦 Step 3: Exporting as npm package');
	const packageFiles = await exportJSONPackage(iconSet, {
		target: './output/npm-package',
		cleanup: true,
		package: {
			name: '@iconify-json/brand',
			version: '1.0.0',
			description: 'Brand icon collection for Iconify',
			author: 'Your Company',
			license: 'MIT',
			keywords: ['icons', 'iconify', 'svg', 'brand'],
			homepage: 'https://example.com/icons',
			repository: {
				type: 'git',
				url: 'https://github.com/example/brand-icons.git',
			},
		},
		customFiles: {
			'README.md': `# Brand Icons

Brand icon collection for Iconify.

## Installation

\`\`\`bash
npm install @iconify-json/brand
\`\`\`

## Usage

\`\`\`typescript
import { addCollection } from '@iconify/react';
import { icons } from '@iconify-json/brand';

addCollection(icons);
\`\`\`

## License

MIT
`,
			'LICENSE': `MIT License

Copyright (c) 2024 Your Company

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...`,
		},
	});

	console.log(`✅ Successfully generated ${packageFiles.length} files`);
	console.log(`   Directory: ./output/npm-package\n`);

	// 4. Display icon set information
	console.log('📊 Icon Set Information:');
	console.log(`   Prefix: ${iconSet.prefix}`);
	console.log(`   Icon count: ${iconSet.count()}`);
	if (iconSet.info) {
		console.log(`   Name: ${iconSet.info.name}`);
		console.log(`   Author: ${iconSet.info.author?.name}`);
		console.log(`   License: ${iconSet.info.license?.title}`);
	}

	console.log('\n✨ Build completed!');
}

main().catch(console.error);
