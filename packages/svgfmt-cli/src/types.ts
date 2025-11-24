import type { FormatOptions } from '@svgfmt/core';

/**
 * CLI format options extending core format options
 */
export interface CliFormatOptions extends FormatOptions {
  /** Output path (file or directory). If not specified, overwrites the original file */
  output?: string;
}

/**
 * Result of formatting a single file
 */
export interface FormatResult {
  /** Input file path */
  input: string;
  /** Output file path */
  output: string;
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Summary of batch formatting operation
 */
export interface FormatSummary {
  /** Total number of files processed */
  total: number;
  /** Number of successfully formatted files */
  success: number;
  /** Number of failed files */
  failed: number;
  /** Individual file results */
  results: FormatResult[];
}
