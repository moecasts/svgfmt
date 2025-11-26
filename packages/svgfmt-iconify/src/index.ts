/**
 * @svgfmt/iconify
 *
 * 为 Iconify 图标集提供增强的导入导出功能。
 * 基于 @iconify/tools，集成 @svgfmt/core 的强大 SVG 处理能力。
 *
 * ## 主要功能
 *
 * - **importDirectory**: 从目录导入 SVG，自动使用 @svgfmt/core 格式化
 * - **exportToDirectory**: 将图标集导出为独立的 SVG 文件
 * - **exportJSONPackage**: 导出为可发布到 npm 的 Iconify JSON 包
 *
 * ## 快速开始
 *
 * ```ts
 * import { importDirectory, exportJSONPackage } from '@svgfmt/iconify';
 *
 * // 1. 导入并处理 SVG
 * const iconSet = await importDirectory('./icons', {
 *   prefix: 'my-icons',
 *   format: {
 *     // @svgfmt/core 的格式化选项
 *   },
 * });
 *
 * // 2. 导出为 npm 包
 * await exportJSONPackage(iconSet, {
 *   target: './dist/iconify-json-my-icons',
 *   package: {
 *     name: '@iconify-json/my-icons',
 *     version: '1.0.0',
 *   },
 * });
 * ```
 *
 * @module @svgfmt/iconify
 * @see {@link https://iconify.design/docs/libraries/tools/}
 * @see {@link https://github.com/your-repo/svgfmt}
 */

// 导出核心函数
export { importDirectory } from './import';
export { exportToDirectory } from './export-directory';
export { exportJSONPackage } from './export-json';

// 导出类型定义
export type {
	ImportDirectoryOptions,
	ExportToDirectoryOptions,
	ExportJSONPackageOptions,
} from './types';

// 重新导出 @iconify/tools 的常用类型，方便使用
export type { IconSet } from '@iconify/tools';
export type { IconifyJSON, IconifyInfo, IconifyIcon } from '@iconify/types';
