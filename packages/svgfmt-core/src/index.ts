import { parseColors, SVG } from '@iconify/tools';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import type { Color } from '@iconify/utils/lib/colors/types';
import { format as prettierFormat } from 'prettier';
import { optimize } from 'svgo';
import { type FillifyOptions, fillify } from './fillify';

// Export types
export * from './fillify';

// Default SVGO plugin configuration
const DEFAULT_SVGO_PLUGINS = [
  { name: 'removeDimensions' },
  { name: 'convertShapeToPath' },
  { name: 'mergePaths' },
  {
    name: 'removeElementsByAttr',
    params: {
      attrs: ['id', 'class', 'data-*', 'clip-path', 'mask'],
    },
  },
  { name: 'removeUselessDefs' },
  { name: 'removeTitle' },
  { name: 'removeDesc' },
  { name: 'cleanupAttrs' },
  { name: 'removeUnusedNS' },
  { name: 'removeEditorsNSData' },
  { name: 'removeEmptyAttrs' },
  { name: 'removeEmptyContainers' },
  { name: 'removeHiddenElems' },
  { name: 'removeStyleElement' },
  { name: 'removeScripts' },
  { name: 'removeRasterImages' },
  { name: 'mergeStyles' },
  { name: 'inlineStyles' },
  { name: 'minifyStyles' },
  { name: 'convertColors' },
  { name: 'removeUnknownsAndDefaults' },
  { name: 'removeNonInheritableGroupAttrs' },
  { name: 'removeUselessStrokeAndFill' },
  { name: 'cleanupIds' },
  { name: 'removeMetadata' },
  { name: 'removeComments' },
  { name: 'removeXMLProcInst' },
  { name: 'cleanupEnableBackground' },
  { name: 'removeEmptyText' },
  { name: 'moveGroupAttrsToElems' },
  { name: 'collapseGroups' },
];

// Create SVGO configuration for removing opacity and style attributes
const createOpacityRemovalConfig = () =>
  ({
    plugins: [
      { name: 'removeDimensions' },
      { name: 'removeStyleElement' },
      { name: 'removeScripts' },
      {
        name: 'removeAttrs',
        params: { attrs: ['fill-opacity', 'stroke-opacity', 'style'] },
      },
    ],
  }) as Parameters<typeof optimize>[1];

// Create complete SVGO optimization configuration
const createMinificationConfig = () =>
  ({
    plugins: [
      ...DEFAULT_SVGO_PLUGINS,
      {
        name: 'removeAttrs',
        params: {
          attrs: [
            '(fill|stroke):((?!currentColor).)*',
            'fill-opacity',
            'stroke-opacity',
            'style',
          ],
        },
      },
    ],
  }) as Parameters<typeof optimize>[1];

// Preprocess SVG: remove dimensions, opacity, styles and scripts
const preprocessSvg = (svgContent: string): string => {
  return optimize(svgContent, createOpacityRemovalConfig()).data;
};

// Unify single solid color to black
const unifySolidColorToBlack = (svgContent: string): string => {
  const colorRegex = /(?:fill|stroke)="([^"]+)"/g;

  // 提取所有颜色属性 (兼容旧版 TypeScript)
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: matchAll polyfill
  while ((match = colorRegex.exec(svgContent)) !== null) {
    matches.push(match);
  }

  // 收集并解析有效的颜色
  const parsedColors = matches
    .map((match) => match[1])
    .filter((colorStr) => colorStr !== 'none' && colorStr !== 'currentColor')
    .map((colorStr) => {
      try {
        return stringToColor(colorStr);
      } catch {
        return null;
      }
    })
    .filter((color): color is Color => color !== null);

  // 如果没有有效颜色或颜色数量为0，直接返回
  if (parsedColors.length === 0) {
    return svgContent;
  }

  // 检查是否存在不同的颜色
  const [firstColor] = parsedColors;
  const hasDifferentColors = parsedColors.some(
    (color) => !compareColors(color, firstColor),
  );

  // 如果所有颜色相同，统一替换为黑色
  if (!hasDifferentColors) {
    return svgContent.replace(colorRegex, (match, colorStr) => {
      // 只替换非none和非currentColor的颜色
      if (colorStr !== 'none') {
        return match.replace(colorStr, 'black');
      }
      return match;
    });
  }

  return svgContent;
};

// Convert black to currentColor
const convertBlackToCurrentColor = (svgContent: string): string => {
  const processedSvg = new SVG(svgContent);

  parseColors(processedSvg, {
    callback: (_attr, colorStr, color) => {
      // 黑色转换为currentColor
      if (color && compareColors(color, stringToColor('black') as Color)) {
        return 'unset';
      }

      // 特殊颜色类型处理
      if (color?.type === 'none' || color?.type === 'current') {
        return 'unset';
      }

      return colorStr;
    },
  });

  return processedSvg.toString();
};

// Optimize SVG using SVGO
const minifySvg = (svgContent: string): string => {
  return optimize(svgContent, createMinificationConfig()).data;
};

// Format SVG code using Prettier
const prettifySvg = async (svgContent: string): Promise<string> => {
  return await prettierFormat(svgContent, { parser: 'html' });
};

export interface FormatOptions extends FillifyOptions {
  /** 自定义转换函数 */
  transform?: (svg: string) => string | Promise<string>;
}

// Main function for formatting SVG
export async function format(
  svgContent: string,
  options: FormatOptions = {},
): Promise<string> {
  const { transform = (svg) => svg, ...fillifyOptions } = options;

  // 预处理：去除尺寸、透明度、样式和脚本
  svgContent = preprocessSvg(svgContent);

  // 统一单一纯色为黑色
  svgContent = unifySolidColorToBlack(svgContent);

  // 合并路径
  svgContent = await fillify(svgContent, fillifyOptions);

  // Convert black to currentColor
  svgContent = convertBlackToCurrentColor(svgContent);

  // 优化SVG
  svgContent = minifySvg(svgContent);

  // 格式化代码
  svgContent = await prettifySvg(svgContent);

  // 自定义转换
  svgContent = await transform(svgContent);

  return svgContent;
}
