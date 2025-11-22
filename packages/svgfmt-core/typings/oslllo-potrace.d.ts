// Declare types for oslllo-potrace
declare module 'oslllo-potrace' {
  interface PotraceOptions {
    svgSize?: number;
    [key: string]: any;
  }

  interface PotraceResult {
    trace(): Promise<string>;
  }

  interface PotraceStatic {
    (pngBuffer: Buffer, options?: PotraceOptions): Promise<PotraceResult>;
  }

  const Potrace: PotraceStatic;
  export default Potrace;
}
