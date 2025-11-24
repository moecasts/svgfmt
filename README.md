# SVG Formatting Library

[English](./README.md) | [简体中文](./README.zh-CN.md)

A powerful SVG processing library specifically designed for optimizing, converting, and formatting SVG files, making them more suitable for use in web applications and icon systems.

## Core Features

### SVG Formatting

```typescript
import { format } from '@svgfmt/core';

// Format a single SVG
const optimizedSvg = await format(svgContent);

// Custom configuration
const customSvg = await format(svgContent, {
  traceResolution: 800, // Increase path merging resolution
});
```

### Color Processing

- **Single Color Unification**: Detects and unifies SVG elements with a single color
- **Color Removal**: Removes fixed color values to inherit parent element color
- **Opacity Handling**: Removes unnecessary opacity attributes

### Path Optimization

- **Path Merging**: Merges multiple paths using advanced image tracing technology
- **Shape Conversion**: Converts complex shapes into optimized paths
- **Cleanup**: Removes hidden elements and useless containers

## Installation and Usage

### Install Dependencies

```bash
pnpm install
```

### Build Project

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Code Linting and Formatting

```bash
# Code linting
pnpm lint

# Type checking
pnpm check-types

# Code formatting
pnpm format

# Full check
pnpm biome:check
```

## Project Structure

```text
svgfmt/
├── packages/
│   └── svgfmt-core/           # Core library
│       ├── src/
│       │   ├── index.ts       # Main entry point, provides formatting functionality
│       │   └── fillify/       # Path merging module
│       └── tests/             # Test files
├── biome.json                 # Code formatting configuration
├── turbo.json                 # Turborepo configuration
└── package.json
```

## Technology Stack

- **Core Library**: Built with TypeScript
- **Image Processing**: Path tracing based on the Potrace algorithm
- **SVG Optimization**: Integrated with SVGO for professional optimization
- **Code Formatting**: Uses Prettier for code beautification
- **Build Tools**: Rslib + Turborepo

## API Reference

### `format(svgContent, options?)`

The main function for formatting SVG strings.

**Parameters:**

- `svgContent: string` - The SVG content to process
- `options?: FormatOptions` - Optional configuration object

**Options:**

- `traceResolution?: number` - Path tracing resolution, default 600
- `transform?: (svg: string) => string | Promise<string>` - Custom transform function

**Returns:**

- `Promise<string>` - Formatted SVG content

### `FillifyOptions`

Configuration options for path merging processing.

```typescript
interface FillifyOptions {
  /** Path tracing resolution, default: 600 */
  traceResolution?: number;
}
```

### `FormatOptions`

Configuration options for formatting processing, extends `FillifyOptions`.

```typescript
interface FormatOptions extends FillifyOptions {
  /** Custom transform function */
  transform?: (svg: string) => string | Promise<string>;
}
```

## Usage Examples

### Basic Usage

```typescript
import { format } from '@svgfmt/core';

// Process single-color icon
const svgContent = `<svg><path fill="#ff0000" d="..."/></svg>`;
const optimized = await format(svgContent);
// Result: <svg><path d="..."/></svg> // Color removed, inherits parent element color
```

### Advanced Configuration

```typescript
import { format } from '@svgfmt/core';

// Process complex icon with higher quality
const complexSvg = await format(svgContent, {
  traceResolution: 1200, // Higher resolution for better quality
});

// Use custom transform function
const customSvg = await format(svgContent, {
  // Custom transform: set all paths to red
  transform: (svg) => svg.replace(/fill="([^"]+)"/g, 'fill="#ff0000"'),
});

// Use async custom transform
const asyncCustomSvg = await format(svgContent, {
  // Async custom transform example
  transform: async (svg) => {
    // Simulate async operation, like API call or complex processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return svg;
  },
});
```

## Development Guide

This project uses modern frontend development toolchain:

- **Package Management**: pnpm + Turborepo
- **Code Quality**: Biome + TypeScript
- **Testing**: rstest
- **Build**: rslib

## License

MIT
