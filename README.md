# SVG格式化工具库

这是一个基于 TypeScript 的 monorepo 工具库项目，用于 SVG 格式化相关的功能。

## 项目结构

本项目使用 Turborepo 进行 monorepo 管理，包含以下部分：

### 包结构

- `packages/*`: TypeScript 工具库包

### 开发工具

本项目配置了以下开发工具：

- [TypeScript](https://www.typescriptlang.org/) 用于静态类型检查
- [Biome](https://biomejs.dev/) 用于代码格式化和检查
- [Turborepo](https://turbo.build/) 用于 monorepo 任务管理

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 构建

构建所有包：

```bash
pnpm build
```

或者使用 turbo：

```bash
# 安装了全局 turbo
turbo build

# 使用 package manager
pnpm exec turbo build
```

### 开发模式

运行开发模式：

```bash
pnpm dev
```

或者使用 turbo：

```bash
# 安装了全局 turbo
turbo dev

# 使用 package manager
pnpm exec turbo dev
```

### 代码检查与格式化

代码检查：

```bash
pnpm lint
```

类型检查：

```bash
pnpm check-types
```

代码格式化：

```bash
pnpm format
```

## 项目规范

本项目使用 Biome 进行代码格式化和检查，请确保在提交代码前运行：

```bash
pnpm biome:check
```

## 相关链接

了解更多关于 Turborepo 的信息：

- [任务](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [缓存](https://turborepo.com/docs/crafting-your-repository/caching)
- [远程缓存](https://turborepo.com/docs/core-concepts/remote-caching)
- [过滤](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [配置选项](https://turborepo.com/docs/reference/configuration)
- [CLI 使用](https://turborepo.com/docs/reference/command-line-reference)
