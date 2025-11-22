// Declare types for oslllo-svg-fixer
declare module 'oslllo-svg-fixer' {
  interface SVGFixerOptions {}
  type SVGFixerCallback = (err: Error | null) => void;
  interface SVGFixerInstance {
    fix(callback: SVGFixerCallback): void;
  }
  const SVGFixer: (
    input: string,
    output: string,
    options: SVGFixerOptions,
  ) => SVGFixerInstance;
  export default SVGFixer;
}
