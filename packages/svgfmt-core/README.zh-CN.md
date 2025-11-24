# @svgfmt/core

[English](./README.md) | [简体中文](./README.zh-CN.md)

SVG 格式化和优化的核心库，提供强大的 SVG 处理功能。

## 安装

```bash
pnpm add @svgfmt/core
```

## 基本使用

### 格式化 SVG

```typescript
import { format } from '@svgfmt/core';

// 基本格式化
const optimizedSvg = await format(svgContent);

// 自定义配置
const customSvg = await format(svgContent, {
  traceResolution: 800, // 提高路径合并分辨率
});
```

### 颜色处理

库会自动处理 SVG 中的颜色：

- **单一颜色检测**：识别只使用一种颜色的 SVG
- **颜色移除**：将单一颜色统一为黑色，然后转换为 `currentColor` 以继承父元素颜色
- **透明度处理**：移除不必要的透明度属性

**重要提示**：本库**仅适用于单色图标**。多色 SVG 会在路径追踪过程中被转换为单色（SVG → PNG → SVG），这个过程会丢失颜色信息。

### 路径合并

使用先进的图像追踪技术，将多个路径元素合并为单个路径：

```typescript
import { format } from '@svgfmt/core';

// 自动路径合并
const mergedSvg = await format(complexSvg, {
  traceResolution: 600, // 路径追踪分辨率
});
```

## API 文档

### `format(svgContent, options?)`

主要的 SVG 格式化函数。

**参数：**

- `svgContent: string` - 要处理的 SVG 内容
- `options?: FormatOptions` - 可选的配置选项

**返回值：**

- `Promise<string>` - 格式化后的 SVG 内容

### `FillifyOptions`

路径合并处理的配置选项。

```typescript
interface FillifyOptions {
  /** 路径追踪分辨率，默认: 600 */
  traceResolution?: number;
}
```

### `FormatOptions`

格式化处理的配置选项，扩展自 `FillifyOptions`。

```typescript
interface FormatOptions extends FillifyOptions {
  /** 自定义转换函数 */
  transform?: (svg: string) => string | Promise<string>;
}
```

## 处理流程

1. **预处理**：去除尺寸、透明度、样式和脚本等不必要的属性
2. **颜色统一**：检测并统一单一颜色为黑色
3. **路径合并**：使用图像追踪技术合并路径
4. **颜色移除**：移除颜色属性，使其继承父元素颜色
5. **SVG 优化**：使用 SVGO 进行深度优化
6. **代码格式化**：使用 Prettier 美化输出代码
7. **自定义转换**：执行用户提供的自定义转换函数

## 示例

### 处理单色图标

```typescript
const input = `<svg width="24" height="24" viewBox="0 0 24 24">
  <path fill="#ff0000" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
</svg>`;

const output = await format(input);
// 结果将移除固定颜色，使其继承父元素颜色
```

### 处理复杂多路径 SVG

```typescript
const complexSvg = `<svg>
  <path d="M10 10 L20 10 L20 20 L10 20 Z" fill="#333"/>
  <path d="M15 15 L25 15 L25 25 L15 25 Z" fill="#333"/>
</svg>`;

const merged = await format(complexSvg);
// 结果将是合并为单个路径的优化 SVG，颜色被移除

// 注意：多色 SVG 会丢失颜色信息
const multiColorSvg = `<svg>
  <path d="..." fill="#ff0000"/>
  <path d="..." fill="#00ff00"/>
</svg>`;
const converted = await format(multiColorSvg);
// 结果：所有元素合并为单个黑色路径（颜色丢失）
```

### 使用自定义转换函数

```typescript
import { format } from '@svgfmt/core';

// 使用同步转换函数
const customSvg = await format(svgContent, {
  // 自定义转换：添加class属性到svg元素
  transform: (svg) => svg.replace(/<svg/, '<svg class="icon"'),
});

// 使用异步转换函数
const asyncCustomSvg = await format(svgContent, {
  // 异步自定义转换示例
  transform: async (svg) => {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 50));
    return svg;
  },
});
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

### 测试

```bash
pnpm test
```

## 技术细节

本库使用以下技术实现功能：

- **@iconify/tools**：SVG 解析和处理
- **oslllo-potrace**：图像追踪和路径合并
- **oslllo-svg-fixer** 和 **oslllo-svg2**：SVG 处理和转换
- **svgo**：SVG 优化
- **prettier**：代码格式化

## 许可证

MIT
