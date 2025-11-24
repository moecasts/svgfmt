# @svgfmt/cli

[English](./README.md) | [简体中文](./README.zh-CN.md)

使用 [@svgfmt/core](../svgfmt-core) 格式化 SVG 文件的命令行工具。

## 功能特性

- 🎯 使用 glob 模式格式化 SVG 文件
- 📁 支持单文件和批量处理
- 🔄 原地格式化或输出到指定目录
- ✨ 将单色 SVG 转换为使用 `currentColor`
- 🧹 移除不必要的属性并优化文件大小
- 📦 易于集成到构建流程中

## 安装

```bash
# 使用 pnpm（在 monorepo 中推荐）
pnpm add @svgfmt/cli

# 使用 npm
npm install @svgfmt/cli

# 使用 yarn
yarn add @svgfmt/cli
```

## 使用方法

### 命令行

```bash
# 格式化单个文件（覆盖原文件）
svgfmt icon.svg

# 使用 glob 模式格式化多个文件
svgfmt "icons/**/*.svg"

# 输出到指定目录
svgfmt "icons/**/*.svg" -o dist/icons

# 输出单个文件到指定位置
svgfmt icon.svg -o formatted-icon.svg

# 显示帮助
svgfmt --help

# 显示版本
svgfmt --version
```

### 编程 API

```typescript
import { formatPattern } from '@svgfmt/cli';

// 格式化匹配模式的文件
const summary = await formatPattern('icons/**/*.svg', {
  output: 'dist/icons',
});

console.log(`已格式化 ${summary.success}/${summary.total} 个文件`);

// 检查单个结果
for (const result of summary.results) {
  if (result.success) {
    console.log(`✓ ${result.input} → ${result.output}`);
  } else {
    console.error(`✗ ${result.input}: ${result.error}`);
  }
}
```

## 选项

- `-o, --output <path>` - 输出目录或文件路径。如果未指定，将原地格式化文件。
- `-V, --version` - 显示版本号
- `-h, --help` - 显示帮助信息

## 示例

### 原地格式化

```bash
# 格式化当前目录中的所有 SVG 文件
svgfmt "*.svg"

# 格式化 src/icons 中的所有 SVG 文件
svgfmt "src/icons/**/*.svg"
```

### 输出到目录

```bash
# 保留目录结构
svgfmt "src/icons/**/*.svg" -o dist/icons
```

### 单个文件

```bash
# 格式化并保存到新文件
svgfmt logo.svg -o logo-formatted.svg
```

## 开发

### 设置

安装依赖：

```bash
pnpm install
```

### 构建

构建 CLI：

```bash
pnpm build
```

监听模式：

```bash
pnpm dev
```

### 测试

运行测试：

```bash
pnpm test
```

## 许可证

MIT
