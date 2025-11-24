# @svgfmt/core

[English](./README.md) | [简体中文](./README.zh-CN.md)

Core library for SVG formatting and optimization, providing powerful SVG processing capabilities.

## Installation

```bash
pnpm add @svgfmt/core
```

## Basic Usage

### Formatting SVG

```typescript
import { format } from '@svgfmt/core';

// Basic formatting
const optimizedSvg = await format(svgContent);

// Custom configuration
const customSvg = await format(svgContent, {
  traceResolution: 800, // Increase path merging resolution
});
```

### Color Processing

The library automatically processes colors in SVG:

- **Single Color Detection**: Identifies SVGs that use only one color
- **Color Removal**: Unifies single colors to black, then converts to `currentColor` to inherit parent element color
- **Opacity Handling**: Removes unnecessary opacity attributes

**Important**: This library is designed for **single-color icons only**. Multi-color SVGs will be converted to single-color during the path tracing process (SVG → PNG → SVG), which loses color information.

### Path Merging

Uses advanced image tracing technology to merge multiple path elements into a single path:

```typescript
import { format } from '@svgfmt/core';

// Automatic path merging
const mergedSvg = await format(complexSvg, {
  traceResolution: 600, // Path tracing resolution
});
```

## API Documentation

### `format(svgContent, options?)`

The main SVG formatting function.

**Parameters:**

- `svgContent: string` - The SVG content to process
- `options?: FormatOptions` - Optional configuration options

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

## Processing Flow

1. **Preprocessing**: Remove unnecessary attributes like dimensions, opacity, styles, and scripts
2. **Color Unification**: Detect and unify single colors to black
3. **Path Merging**: Merge paths using image tracing technology
4. **Color Removal**: Remove color attributes to inherit parent element color
5. **SVG Optimization**: Perform deep optimization using SVGO
6. **Code Formatting**: Beautify output code using Prettier
7. **Custom Transform**: Execute user-provided custom transform function

## Examples

### Processing Single-Color Icon

```typescript
const input = `<svg width="24" height="24" viewBox="0 0 24 24">
  <path fill="#ff0000" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
</svg>`;

const output = await format(input);
// Result will remove fixed color to inherit parent element color
```

### Processing Complex Multi-Path SVG

```typescript
const complexSvg = `<svg>
  <path d="M10 10 L20 10 L20 20 L10 20 Z" fill="#333"/>
  <path d="M15 15 L25 15 L25 25 L15 25 Z" fill="#333"/>
</svg>`;

const merged = await format(complexSvg);
// Result will be a single optimized path with color removed

// Note: Multi-color SVGs will lose color information
const multiColorSvg = `<svg>
  <path d="..." fill="#ff0000"/>
  <path d="..." fill="#00ff00"/>
</svg>`;
const converted = await format(multiColorSvg);
// Result: Single black path merged from all elements (colors lost)
```

### Using Custom Transform Function

```typescript
import { format } from '@svgfmt/core';

// Using synchronous transform function
const customSvg = await format(svgContent, {
  // Custom transform: add class attribute to svg element
  transform: (svg) => svg.replace(/<svg/, '<svg class="icon"'),
});

// Using asynchronous transform function
const asyncCustomSvg = await format(svgContent, {
  // Async custom transform example
  transform: async (svg) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    return svg;
  },
});
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Testing

```bash
pnpm test
```

## Technical Details

This library uses the following technologies to implement its functionality:

- **@iconify/tools**: SVG parsing and processing
- **oslllo-potrace**: Image tracing and path merging
- **oslllo-svg-fixer** and **oslllo-svg2**: SVG processing and conversion
- **svgo**: SVG optimization
- **prettier**: Code formatting

## License

MIT
