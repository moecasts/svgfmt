import fs from 'node:fs/promises';
import path from 'node:path';
import { format } from '@svgfmt/core';
import fg from 'fast-glob';
import type { CliFormatOptions, FormatResult, FormatSummary } from './types';

/**
 * Format multiple SVG files based on glob pattern
 */
export async function formatFiles(
  pattern: string,
  options: CliFormatOptions = {},
): Promise<FormatSummary> {
  const { output, ...formatOptions } = options;

  // Find all matching files
  const files = await fg(pattern, {
    onlyFiles: true,
    absolute: true,
  });

  if (files.length === 0) {
    throw new Error(`No files found matching pattern: ${pattern}`);
  }

  // Process all files
  const results: FormatResult[] = [];

  for (const inputFile of files) {
    const result = await formatSingleFile(inputFile, output, formatOptions);
    results.push(result);
  }

  // Generate summary
  const summary: FormatSummary = {
    total: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };

  return summary;
}

/**
 * Format a single SVG file
 */
async function formatSingleFile(
  inputFile: string,
  output: string | undefined,
  formatOptions: Omit<CliFormatOptions, 'output'>,
): Promise<FormatResult> {
  try {
    // Read input file
    const content = await fs.readFile(inputFile, 'utf-8');

    // Validate SVG content
    if (!content.trim().startsWith('<svg') && !content.includes('<svg')) {
      throw new Error('Invalid SVG file: must contain <svg> element');
    }

    // Format the SVG with the provided options (including transform if present)
    const formatted = await format(content, formatOptions);

    // Determine output path
    const outputFile = determineOutputPath(inputFile, output);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputFile), { recursive: true });

    // Write formatted content
    await fs.writeFile(outputFile, formatted, 'utf-8');

    return {
      input: inputFile,
      output: outputFile,
      success: true,
    };
  } catch (error) {
    return {
      input: inputFile,
      output: output || inputFile,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Determine the output path for a file
 */
function determineOutputPath(
  inputFile: string,
  output: string | undefined,
): string {
  if (!output) {
    // No output specified, overwrite the original file
    return inputFile;
  }

  // Check if output is a directory or file
  // If it ends with .svg, treat as file
  if (output.endsWith('.svg')) {
    return path.resolve(output);
  }

  // Otherwise, treat as directory and preserve filename
  const filename = path.basename(inputFile);
  return path.resolve(output, filename);
}

/**
 * Format files and return detailed results
 * This is the main programmatic API
 */
export async function formatPattern(
  pattern: string,
  options: CliFormatOptions = {},
): Promise<FormatSummary> {
  return formatFiles(pattern, options);
}
