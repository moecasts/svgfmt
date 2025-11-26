# @svgfmt/iconify

Enhanced Iconify icon set tools with [@svgfmt/core](../svgfmt-core) integration.

## Features

- 🎨 **Auto-formatted SVG**: Automatically process SVG files using `@svgfmt/core`
- 📦 **Easy Import**: Import entire directories of SVG files
- 🚀 **Multiple Exports**: Export to SVG directory or npm-ready JSON packages
- 🔧 **Full Control**: All options from `@iconify/tools` plus `@svgfmt/core` formatting
- 📝 **Type-safe**: Complete TypeScript support

## Installation

```bash
npm install @svgfmt/iconify @svgfmt/core
```

## Quick Start

```typescript
import { importDirectory, exportJSONPackage } from '@svgfmt/iconify';

// 1. Import and process SVG files
const iconSet = await importDirectory('./icons', {
  prefix: 'my-icons',
  format: {
    // @svgfmt/core formatting options
  },
});

// 2. Export as npm package
await exportJSONPackage(iconSet, {
  target: './dist/iconify-json-my-icons',
  package: {
    name: '@iconify-json/my-icons',
    version: '1.0.0',
  },
});
```

## API

### `importDirectory(dir, options)`

Import SVG files from a directory and create an IconSet with automatic formatting.

**Parameters:**

- `dir` (string): Directory path containing SVG files
- `options` (ImportDirectoryOptions): Configuration options

**Options:**

```typescript
interface ImportDirectoryOptions {
  // Icon set prefix (required)
  prefix: string;

  // Scan subdirectories (default: true)
  includeSubDirs?: boolean;

  // Custom icon naming function
  keyword?: (file: ImportDirectoryFileEntry, defaultKeyword: string, iconSet: IconSet) => 
    string | undefined | Promise<string | undefined>;

  // Error handling: false | true | "warn" (default: true)
  ignoreImportErrors?: boolean | 'warn';

  // Keep SVG titles (default: false)
  keepTitles?: boolean;

  // @svgfmt/core format options
  format?: FormatOptions;

  // Icon set metadata
  info?: IconifyInfo;

  // Default icon dimensions
  defaults?: {
    width?: number;
    height?: number;
  };
}
```

**Example:**

```typescript
const iconSet = await importDirectory('./icons', {
  prefix: 'brand',
  includeSubDirs: true,
  format: {
    transform: (svg) => svg.replace(/fill="[^"]*"/g, 'fill="currentColor"'),
  },
  info: {
    name: 'Brand Icons',
    author: { name: 'Your Name' },
    license: { title: 'MIT' },
  },
  defaults: {
    width: 24,
    height: 24,
  },
  keyword: (file) => file.file.toLowerCase(),
});
```

### `exportToDirectory(iconSet, options)`

Export IconSet as individual SVG files to a directory.

**Parameters:**

- `iconSet` (IconSet): Icon set to export
- `options` (ExportToDirectoryOptions): Export configuration

**Options:**

```typescript
interface ExportToDirectoryOptions {
  // Target directory (required)
  target: string;

  // Clear target directory before export (default: false)
  cleanup?: boolean;

  // Auto-set height to match viewBox (default: true)
  autoHeight?: boolean;

  // Include alias files (default: true)
  includeAliases?: boolean;

  // Include character mapping files (default: false)
  includeChars?: boolean;

  // Enable logging (default: false)
  log?: boolean;
}
```

**Example:**

```typescript
await exportToDirectory(iconSet, {
  target: './dist/svg',
  cleanup: true,
  log: true,
});
```

### `exportJSONPackage(iconSet, options)`

Export IconSet as an npm-ready Iconify JSON package.

**Parameters:**

- `iconSet` (IconSet): Icon set to export
- `options` (ExportJSONPackageOptions): Package configuration

**Options:**

```typescript
interface ExportJSONPackageOptions {
  // Target directory (required)
  target: string;

  // Clear target directory before export (default: false)
  cleanup?: boolean;

  // package.json configuration (required)
  package: {
    name: string;
    version: string;
    description?: string;
    author?: string | { name: string; email?: string; url?: string };
    license?: string;
    bugs?: string | { url: string };
    homepage?: string;
    repository?: string | { type: string; url: string };
    keywords?: string[];
    [key: string]: unknown;
  };

  // Custom files to include
  customFiles?: Record<string, string | Record<string, unknown> | null>;
}
```

**Example:**

```typescript
await exportJSONPackage(iconSet, {
  target: './dist/iconify-json-brand',
  cleanup: true,
  package: {
    name: '@iconify-json/brand',
    version: '1.0.0',
    description: 'Brand icon collection',
    author: 'Your Name',
    license: 'MIT',
  },
  customFiles: {
    'README.md': '# Brand Icons\n\nCustom icon collection.',
    'LICENSE': 'MIT License\n\nCopyright (c) 2024...',
  },
});
```

## Complete Workflow Example

```typescript
import { 
  importDirectory, 
  exportToDirectory, 
  exportJSONPackage 
} from '@svgfmt/iconify';

async function buildIconSet() {
  // 1. Import and format SVG files
  const iconSet = await importDirectory('./src/icons', {
    prefix: 'app',
    format: {
      // Custom SVG transformation
      transform: (svg) => {
        return svg.replace(/stroke-width="[^"]*"/g, 'stroke-width="2"');
      },
    },
    info: {
      name: 'App Icons',
      author: {
        name: 'Your Name',
        url: 'https://yoursite.com',
      },
      license: {
        title: 'MIT',
        spdx: 'MIT',
      },
    },
    defaults: {
      width: 20,
      height: 20,
    },
  });

  // 2. Export to both SVG directory and JSON package
  await Promise.all([
    // Export individual SVG files
    exportToDirectory(iconSet, {
      target: './dist/svg',
      cleanup: true,
      log: true,
    }),

    // Export as npm package
    exportJSONPackage(iconSet, {
      target: './dist/npm-package',
      cleanup: true,
      package: {
        name: '@your-org/app-icons',
        version: '1.0.0',
        description: 'App icon collection',
        author: 'Your Name',
        license: 'MIT',
        repository: {
          type: 'git',
          url: 'https://github.com/your-org/app-icons.git',
        },
      },
      customFiles: {
        'README.md': '# App Icons\n\nCustom icon collection for our app.',
      },
    }),
  ]);

  console.log(`✅ Built ${iconSet.count()} icons`);
}

buildIconSet();
```

## Comparison with @iconify/tools

### Standard @iconify/tools Workflow

```typescript
import { 
  importDirectory, 
  cleanupSVG, 
  runSVGO, 
  parseColors 
} from '@iconify/tools';

// Import icons
const iconSet = await importDirectory('files/svg', { prefix: 'test' });

// Manual processing for each icon
iconSet.forEach((name, type) => {
  if (type !== 'icon') return;
  
  const svg = iconSet.toSVG(name);
  if (!svg) return;
  
  // Manual cleanup and optimization
  cleanupSVG(svg);
  parseColors(svg, {
    defaultColor: 'currentColor',
    callback: (attr, colorStr, color) => {
      return !color || isEmptyColor(color) ? colorStr : 'currentColor';
    },
  });
  runSVGO(svg);
  
  iconSet.fromSVG(name, svg);
});
```

### @svgfmt/iconify Workflow

```typescript
import { importDirectory } from '@svgfmt/iconify';

// Import with automatic processing
const iconSet = await importDirectory('files/svg', {
  prefix: 'test',
  format: {
    // All processing handled by @svgfmt/core
  },
});
```

## Using the Generated Package

After publishing to npm, users can consume the icon set:

```typescript
import { addCollection } from '@iconify/react';
import { icons } from '@iconify-json/my-icons';

// Add to Iconify
addCollection(icons);

// Use in components
<Icon icon="my-icons:home" />
```

## License

MIT

## Related

- [@svgfmt/core](../svgfmt-core) - Core SVG formatting functionality
- [@iconify/tools](https://iconify.design/docs/libraries/tools/) - Official Iconify tools
- [@iconify/types](https://www.npmjs.com/package/@iconify/types) - Iconify TypeScript types
