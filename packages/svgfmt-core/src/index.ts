import { parseColors, SVG } from '@iconify/tools';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import type { Color } from '@iconify/utils/lib/colors/types';
import { format as prettierFormat } from 'prettier';
import { optimize } from 'svgo';
import { fillify } from './fillify';

// 导出类型
export * from './fillify';

// 默认SVGO插件配置
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

// 创建透明度和样式属性移除的SVGO配置
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

// 创建完整的SVGO优化配置
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

// 预处理SVG：去除尺寸、透明度、样式和脚本
const preprocessSvg = (svgContent: string): string => {
  return optimize(svgContent, createOpacityRemovalConfig()).data;
};

// 将单一纯色统一为黑色
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

// 将黑色转换为currentColor
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

// 使用SVGO优化SVG
const minifySvg = (svgContent: string): string => {
  return optimize(svgContent, createMinificationConfig()).data;
};

// 使用Prettier格式化SVG代码
const prettifySvg = async (svgContent: string): Promise<string> => {
  return await prettierFormat(svgContent, { parser: 'html' });
};

// 格式化SVG的主函数
export async function format(
  svgContent: string,
  options?: import('./fillify').FillifyOptions,
): Promise<string> {
  // 预处理：去除尺寸、透明度、样式和脚本
  svgContent = preprocessSvg(svgContent);

  // 统一单一纯色为黑色
  svgContent = unifySolidColorToBlack(svgContent);

  // 合并路径
  svgContent = await fillify(svgContent, options);

  // 将黑色转换为currentColor
  svgContent = convertBlackToCurrentColor(svgContent);

  // 优化SVG
  svgContent = minifySvg(svgContent);

  // 格式化代码
  svgContent = await prettifySvg(svgContent);

  return svgContent;
}
