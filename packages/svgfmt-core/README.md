# @svgfmt/core

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

库会自动检测 SVG 中的颜色，并进行以下处理：

- **单一颜色检测**：识别只使用一种颜色的 SVG
- **颜色移除**：将单一颜色统一为黑色，然后移除颜色属性，使其继承父元素颜色
- **多色保持**：对于多色 SVG，保持原始颜色不变
- **透明度处理**：移除不必要的透明度属性

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
- `options?: FillifyOptions` - 可选的配置选项

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

## 处理流程

1. **预处理**：去除尺寸、透明度、样式和脚本等不必要的属性
2. **颜色统一**：检测并统一单一颜色为黑色
3. **路径合并**：使用图像追踪技术合并路径
4. **颜色移除**：移除颜色属性，使其继承父元素颜色
5. **SVG 优化**：使用 SVGO 进行深度优化
6. **代码格式化**：使用 Prettier 美化输出代码

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
// 结果将是合并为单个路径的优化 SVG
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

[查看许可证文件](../../LICENSE)
