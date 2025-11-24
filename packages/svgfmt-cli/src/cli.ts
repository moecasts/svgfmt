#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { formatPattern } from './formatter';

const program = new Command();

/**
 * Transform function type
 */
type TransformFunction = (svg: string) => string | Promise<string>;

/**
 * Load transform function from file path or inline code
 */
async function loadTransformFunction(
  transformPath: string,
): Promise<TransformFunction> {
  // Check if it looks like inline code (contains function keywords or arrow function syntax)
  const looksLikeCode =
    transformPath.includes('=>') ||
    transformPath.includes('function') ||
    transformPath.includes('return') ||
    transformPath.startsWith('async ') ||
    transformPath.startsWith('(');

  // If it looks like code, treat as inline code
  if (looksLikeCode) {
    return loadTransformFromCode(transformPath);
  }

  // Otherwise treat as file path
  return await loadTransformFromFile(transformPath);
}

/**
 * Load transform function from a file
 */
async function loadTransformFromFile(
  filePath: string,
): Promise<TransformFunction> {
  try {
    const absolutePath = path.resolve(filePath);
    const fileUrl = pathToFileURL(absolutePath).href;

    // Dynamic import the module
    const module = await import(fileUrl);

    // Check for default export
    if (module.default && typeof module.default === 'function') {
      return module.default as TransformFunction;
    }

    // Check for named export 'transform'
    if (module.transform && typeof module.transform === 'function') {
      return module.transform as TransformFunction;
    }

    throw new Error(
      'Transform file must export a default function or a named function called "transform"',
    );
  } catch (error) {
    throw new Error(
      `Failed to load transform from file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Load transform function from inline code
 */
function loadTransformFromCode(code: string): TransformFunction {
  try {
    // Create an async function from the code
    // The code should be a function body that returns the transformed SVG
    const AsyncFunction = (async () => {}).constructor as new (
      ...args: string[]
    ) => (...args: unknown[]) => Promise<unknown>;

    const transformFn = new AsyncFunction('svg', `return (${code})(svg);`);

    return async (svg: string) => {
      try {
        const result = await transformFn(svg);
        return String(result);
      } catch (error) {
        throw new Error(
          `Transform execution failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };
  } catch (error) {
    throw new Error(
      `Failed to parse transform code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

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
    .option(
      '-t, --transform <value>',
      'Transform function: file path (e.g., "./transform.js") or inline code (e.g., "svg => svg.replace(...)")',
    )
    .action(
      async (
        pattern: string,
        options: { output?: string; transform?: string },
      ) => {
        try {
          console.log(`Formatting SVG files matching: ${pattern}`);

          // Load transform function if provided
          let transformFn: TransformFunction | undefined;
          if (options.transform) {
            transformFn = await loadTransformFunction(options.transform);
          }

          const summary = await formatPattern(pattern, {
            output: options.output,
            transform: transformFn,
          });

          // Print summary
          console.log(
            `\n✓ Formatted ${summary.success}/${summary.total} files`,
          );

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
      },
    );

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
