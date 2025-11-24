# @svgfmt/cli

[English](./README.md) | [简体中文](./README.zh-CN.md)

CLI tool for formatting SVG files using [@svgfmt/core](../svgfmt-core).

## Features

- 🎯 Format SVG files using glob patterns
- 📁 Support for single files and batch processing
- 🔄 In-place formatting or output to specified directory
- ✨ Converts single-color SVGs to use `currentColor`
- 🧹 Removes unnecessary attributes and optimizes file size
- 🔧 Custom transform functions (file or inline code)
- 📦 Easy to integrate into build pipelines

## Installation

```bash
# Using pnpm (recommended in monorepo)
pnpm add @svgfmt/cli

# Using npm
npm install @svgfmt/cli

# Using yarn
yarn add @svgfmt/cli
```

## Usage

### Command Line

```bash
# Format a single file (overwrites original)
svgfmt icon.svg

# Format multiple files using glob pattern
svgfmt "icons/**/*.svg"

# Output to a specific directory
svgfmt "icons/**/*.svg" -o dist/icons

# Output single file to specific location
svgfmt icon.svg -o formatted-icon.svg

# Show help
svgfmt --help

# Show version
svgfmt --version
```

### Programmatic API

```typescript
import { formatPattern } from '@svgfmt/cli';

// Format files matching a pattern
const summary = await formatPattern('icons/**/*.svg', {
  output: 'dist/icons',
});

console.log(`Formatted ${summary.success}/${summary.total} files`);

// Check individual results
for (const result of summary.results) {
  if (result.success) {
    console.log(`✓ ${result.input} → ${result.output}`);
  } else {
    console.error(`✗ ${result.input}: ${result.error}`);
  }
}
```

## Options

- `-o, --output <path>` - Output directory or file path. If not specified, files are formatted in place.
- `-t, --transform <value>` - Custom transform function: file path (e.g., `./transform.js`) or inline code (e.g., `svg => svg.replace(...)`).
- `-V, --version` - Display version number
- `-h, --help` - Display help information

## Examples

### In-place Formatting

```bash
# Format all SVG files in current directory
svgfmt "*.svg"

# Format all SVG files in src/icons
svgfmt "src/icons/**/*.svg"
```

### Output to Directory

```bash
# Preserve directory structure
svgfmt "src/icons/**/*.svg" -o dist/icons
```

### Single File

```bash
# Format and save to new file
svgfmt logo.svg -o logo-formatted.svg
```

### Custom Transform

You can apply custom transformations to SVG files using the `-t` / `--transform` option.

#### Using a Transform File

Create a transform file that exports a function:

```javascript
// transform.js
export default function addCustomClass(svg) {
  return svg.replace(/<svg/, '<svg class="custom-icon"');
}
```

Or use a named export:

```javascript
// transform.js
export function transform(svg) {
  return svg.replace(/<svg/, '<svg data-processed="true"');
}
```

Then use it with the CLI:

```bash
svgfmt "icons/**/*.svg" --transform ./transform.js
```

#### Using Inline Code

For simple transformations, you can use inline code:

```bash
# Add a custom attribute
svgfmt "icons/**/*.svg" -t 'svg => svg.replace(/<svg/, "<svg data-icon=\"true\"")'

# Async transform
svgfmt "icons/**/*.svg" -t 'async svg => { await doSomething(); return svg; }'
```

#### Using with Programmatic API

```typescript
import { formatPattern } from '@svgfmt/cli';

// Pass a transform function directly
const summary = await formatPattern('icons/**/*.svg', {
  output: 'dist/icons',
  transform: (svg) => {
    // Add custom attributes
    return svg.replace(/<svg/, '<svg class="icon"');
  },
});

// Or async transform
const summary2 = await formatPattern('icons/**/*.svg', {
  transform: async (svg) => {
    // Perform async operations
    const processed = await processWithAPI(svg);
    return processed;
  },
});
```

## Development

### Setup

Install dependencies:

```bash
pnpm install
```

### Build

Build the CLI:

```bash
pnpm build
```

Watch mode:

```bash
pnpm dev
```

### Test

Run tests:

```bash
pnpm test
```

## License

MIT
