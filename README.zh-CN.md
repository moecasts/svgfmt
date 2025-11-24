# SVG格式化工具库

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个强大的 SVG 处理工具库，专门用于优化、转换和格式化 SVG 文件，使其更适合在 Web 应用和图标系统中使用。

## 核心功能

### SVG 格式化

```typescript
import { format } from '@svgfmt/core';

// 格式化单个 SVG
const optimizedSvg = await format(svgContent);

// 自定义配置
const customSvg = await format(svgContent, {
  traceResolution: 800, // 提高路径合并分辨率
});
```

### 颜色处理

- **单色优化**：自动将单色 SVG 转换为使用 `currentColor`，以便通过 CSS 继承颜色
- **颜色移除**：移除单色图标的固定颜色值
- **透明度处理**：移除不必要的透明度属性

**注意**：本工具**仅适用于单色图标**。多色 SVG 会在路径追踪过程中被转换为单色，因为工具会将 SVG 转换为 PNG 再转回 SVG，这个过程会丢失颜色信息。

### 路径优化

- **路径合并**：使用先进的图像追踪技术合并多个路径
- **形状转换**：将复杂形状转换为优化的路径
- **无用元素清理**：移除隐藏元素和无用容器

## 安装使用

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

### 代码检查与格式化

```bash
# 代码检查
pnpm lint

# 类型检查
pnpm check-types

# 代码格式化
pnpm format

# 完整检查
pnpm biome:check
```

## 项目结构

```text
svgfmt/
├── packages/
│   └── svgfmt-core/           # 核心库
│       ├── src/
│       │   ├── index.ts       # 主入口，提供格式化功能
│       │   └── fillify/       # 路径合并模块
│       └── tests/             # 测试文件
├── biome.json                 # 代码格式化配置
├── turbo.json                 # Turborepo 配置
└── package.json
```

## 技术栈

- **核心库**：使用 TypeScript 构建
- **图像处理**：基于 Potrace 算法的路径追踪
- **SVG 优化**：集成 SVGO 进行专业优化
- **代码格式化**：使用 Prettier 进行代码美化
- **构建工具**：Rslib + Turborepo

## API 参考

### `format(svgContent, options?)`

格式化 SVG 字符串的主要函数。

**参数：**

- `svgContent: string` - 要处理的 SVG 内容
- `options?: FormatOptions` - 可选配置对象

**选项：**

- `traceResolution?: number` - 路径追踪分辨率，默认 600
- `transform?: (svg: string) => string | Promise<string>` - 自定义转换函数

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

## 使用示例

### 基础使用

```typescript
import { format } from '@svgfmt/core';

// 处理单色图标
const svgContent = `<svg><path fill="#ff0000" d="..."/></svg>`;
const optimized = await format(svgContent);
// 结果: <svg><path d="..."/></svg> // 颜色被移除，使用 currentColor 继承父元素颜色

// 注意：多色 SVG 会被转换为单色
const multiColorSvg = `<svg><path fill="#ff0000" d="..."/><path fill="#00ff00" d="..."/></svg>`;
const converted = await format(multiColorSvg);
// 结果: 所有元素合并为单个黑色路径（颜色信息丢失）
```

### 高级配置

```typescript
import { format } from '@svgfmt/core';

// 处理复杂图标，提高处理质量
const complexSvg = await format(svgContent, {
  traceResolution: 1200, // 更高分辨率，更好质量
});

// 使用自定义转换函数
const customSvg = await format(svgContent, {
  // 自定义转换：将所有路径设置为红色
  transform: (svg) => svg.replace(/fill="([^"]+)"/g, 'fill="#ff0000"'),
});

// 使用异步自定义转换
const asyncCustomSvg = await format(svgContent, {
  // 异步自定义转换示例
  transform: async (svg) => {
    // 模拟异步操作，如API调用或复杂处理
    await new Promise(resolve => setTimeout(resolve, 100));
    return svg;
  },
});
```

## 开发指南

本项目使用现代前端开发工具链：

- **包管理**：pnpm + Turborepo
- **代码质量**：Biome + TypeScript
- **测试**：rstest
- **构建**：rslib

## 许可证

MIT
