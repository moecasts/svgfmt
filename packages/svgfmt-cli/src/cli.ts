#!/usr/bin/env node

import { Command } from 'commander';
import { formatPattern } from './formatter';

const program = new Command();

// Read package.json for version info
async function getPackageInfo() {
  try {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    };
  } catch {
    return {
      name: '@svgfmt/cli',
      version: '0.0.0',
      description: 'CLI tool for formatting SVG files',
    };
  }
}

async function main() {
  const packageInfo = await getPackageInfo();

  program
    .name('svgfmt')
    .description(packageInfo.description || 'Format SVG files')
    .version(packageInfo.version)
    .argument('<pattern>', 'Glob pattern to match SVG files (e.g., "**/*.svg")')
    .option('-o, --output <path>', 'Output directory or file path')
    .action(async (pattern: string, options: { output?: string }) => {
      try {
        console.log(`Formatting SVG files matching: ${pattern}`);

        const summary = await formatPattern(pattern, {
          output: options.output,
        });

        // Print summary
        console.log(`\n✓ Formatted ${summary.success}/${summary.total} files`);

        if (summary.failed > 0) {
          console.error(`\n✗ Failed to format ${summary.failed} files:`);
          for (const result of summary.results) {
            if (!result.success) {
              console.error(`  - ${result.input}: ${result.error}`);
            }
          }
          process.exit(1);
        }

        // Print output locations
        if (options.output) {
          console.log(`\nOutput location: ${options.output}`);
        } else {
          console.log('\nFiles formatted in place');
        }
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
