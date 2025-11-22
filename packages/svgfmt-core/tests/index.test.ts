import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, test } from '@rstest/core';

import { format } from '../src/index';

describe('format', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const solidFixturesDir = path.join(fixturesDir, 'solid');

  // 读取所有测试用SVG内容
  const singleColorSvgContent = fs.readFileSync(
    path.join(fixturesDir, 'single-color.svg'),
    'utf8',
  );
  const multiColorSvgContent = fs.readFileSync(
    path.join(fixturesDir, 'multi-color.svg'),
    'utf8',
  );
  const opacitySvgContent = fs.readFileSync(
    path.join(fixturesDir, 'with-opacity.svg'),
    'utf8',
  );

  test('应该成功处理单色SVG文件并将其转换为currentColor', async () => {
    const result = await format(singleColorSvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-single-color.svg',
    );

    // 同时验证颜色转换
    expect(result).not.toContain('red');
  });

  test('应该正确处理多色SVG文件', async () => {
    const result = await format(multiColorSvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-multi-color.svg',
    );
  });

  test('应该移除透明度相关属性', async () => {
    const result = await format(opacitySvgContent);
    await expect(result).toMatchFileSnapshot(
      './snapshots/format-with-opacity.svg',
    );

    // 验证透明度属性已被移除
    expect(result).not.toContain('fill-opacity');
    expect(result).not.toContain('stroke-opacity');
  });

  test('应该批量处理solid文件夹下的所有SVG文件', async () => {
    // 读取solid文件夹中的所有SVG文件
    const svgFiles = fs.readdirSync(solidFixturesDir).filter(file => file.endsWith('.svg'));
    
    // 对每个SVG文件进行格式化处理并保存快照
    for (const svgFile of svgFiles) {
      const svgContent = fs.readFileSync(path.join(solidFixturesDir, svgFile), 'utf8');
      const result = await format(svgContent);
      
      await expect(result).toMatchFileSnapshot(
        `./snapshots/solid/${svgFile}`,
      );
    }
  });
});
