import { importDirectory, exportJSONPackage } from './src';

async function main() {
    // 导入并处理 SVG
    const iconSet = await importDirectory('./custom-icons', {
        prefix: 'custom', // 自定义图标集前缀
        format: {
            // @svgfmt/core 格式化选项
            cleanup: true,
            optimize: true,
            transform: (svg) => svg.replace(/fill="[^"]*"/g, 'fill="currentColor"'),
        },
    });

    // 导出为 npm 包
    await exportJSONPackage(iconSet, {
        target: './output/iconify-json-custom',
        cleanup: true,
        package: {
            name: '@iconify-json/custom',
            version: '1.0.0',
            description: 'Custom icon collection',
            license: 'MIT',
        },
    });
}

main().catch(console.error);
