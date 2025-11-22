// Declare types for oslllo-svg2
declare module 'oslllo-svg2' {
  interface Dimensions {
    width: number;
    height: number;
  }

  interface ResizeOptions {
    width?: number;
    height?: number;
  }

  interface PngOptions {
    transparent?: boolean;
  }

  interface PngResult {
    toBuffer(): Promise<Buffer>;
  }

  interface SvgMethods {
    dimensions(): Dimensions;
    resize(options: ResizeOptions): Svg2Instance;
  }

  interface Svg2Instance {
    svg: SvgMethods;
    png(options?: PngOptions): PngResult;
    toElement(): Element;
  }

  interface Svg2Static {
    (svgString?: string): Svg2Instance;
  }

  const Svg2: Svg2Static;
  export default Svg2;
}
