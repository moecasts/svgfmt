import Potrace from 'oslllo-potrace';
import Svg2 from 'oslllo-svg2';

export interface FillifyOptions {
  /** Resolution for tracing, default: 600 */
  traceResolution?: number;
}

export async function fillify(
  svgString: string,
  options: FillifyOptions = {},
): Promise<string> {
  const traceResolution = options.traceResolution || 600;
  let filled = false;

  // Parse SVG from input string
  const svg2 = Svg2(svgString);
  const rootElement = svg2.toElement();
  const rootOuterHTML = rootElement.outerHTML;

  // Get original dimensions
  const originalDimensions = svg2.svg.dimensions();

  // Resize SVG to the specified trace resolution
  const resizedWidth = traceResolution;
  const resizedHeight =
    (resizedWidth / originalDimensions.width) * originalDimensions.height;

  const resizedElement = Svg2(rootOuterHTML)
    .svg.resize({ width: resizedWidth, height: resizedHeight })
    .toElement();

  const resizedDimensions = Svg2(resizedElement.outerHTML).svg.dimensions();
  const scale = originalDimensions.width / resizedDimensions.width;

  // Helper to get first path element
  const getFirstPathElement = (element: Element): SVGPathElement | null => {
    const paths = element.getElementsByTagName('path');
    return paths.length > 0 ? (paths[0] as SVGPathElement) : null;
  };

  // Helper to check if element has fill
  const hasFill = (element: Element): boolean => {
    if (element.hasAttribute('fill')) {
      const fillValue = element.getAttribute('fill');
      if (fillValue && fillValue !== 'none') {
        filled = true;
        return true;
      }
    }
    return false;
  };

  // Helper to set fill to black
  const setFillBlack = (element: Element): void => {
    element.setAttribute('fill', '#000');
  };

  // Helper to get attributes excluding "d" (path data)
  const getAttributes = (
    element: Element,
  ): { name: string; value: string }[] => {
    return Array.from(element.attributes)
      .filter((attribute) => attribute.name !== 'd')
      .map((attribute) => ({ name: attribute.name, value: attribute.value }));
  };

  // Helper to reset element attributes
  const resetAttributes = (
    element: Element,
    attributes: { name: string; value: string }[],
  ): void => {
    // Remove all existing attributes except "d"
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      const attribute = element.attributes[i];
      if (attribute.name !== 'd') {
        element.removeAttribute(attribute.name);
      }
    }

    // Set new attributes
    attributes.forEach((attribute) => {
      if (attribute.name === 'viewBox') {
        // Set min-x and min-y to 0 while preserving width and height
        const viewBoxParts = attribute.value
          .split(' ')
          .map((part) => part.trim());
        if (viewBoxParts.length === 4) {
          viewBoxParts[0] = '0'; // min-x
          viewBoxParts[1] = '0'; // min-y
          element.setAttribute('viewBox', viewBoxParts.join(' '));
        }
      } else if (element.tagName.toLowerCase() === 'path') {
        // Special handling for path attributes
        if (
          (attribute.name === 'stroke' &&
            attribute.value !== '#000' &&
            attribute.value !== 'black') ||
          (attribute.name === 'fill' &&
            attribute.value !== '#000' &&
            attribute.value !== 'black')
        ) {
          element.setAttribute(attribute.name, attribute.value);
        }
      } else {
        element.setAttribute(attribute.name, attribute.value);
      }
    });

    // Set default path attributes
    if (element.tagName.toLowerCase() === 'path') {
      element.setAttribute('stroke', 'none');
      element.setAttribute('fill-rule', 'evenodd');

      // Set fill color if not already filled
      if (!filled) {
        let pathColor = 'black';

        // Try to extract fill color from original path style
        const originalPath = getFirstPathElement(rootElement);
        if (originalPath) {
          const style = originalPath.getAttribute('style');
          if (style) {
            const fillStyle = style
              .split(';')
              .find((part) => part.trim().startsWith('fill:'));
            if (fillStyle) {
              const [, color] = fillStyle.split(':');
              if (color && !color.includes('none')) {
                pathColor = color.trim();
              }
            }
          }
        }

        element.setAttribute('fill', pathColor);
      }
    }
  };

  // Process fill color
  const processedElement = resizedElement.cloneNode(true) as Element;
  const resizedPath = getFirstPathElement(processedElement);

  if (resizedPath && hasFill(resizedPath)) {
    setFillBlack(resizedPath);
  } else if (hasFill(processedElement)) {
    setFillBlack(processedElement);
  }

  // Ensure viewbox is set correctly
  if (!processedElement.getAttribute('viewBox')) {
    processedElement.setAttribute(
      'viewBox',
      `0 0 ${originalDimensions.width} ${originalDimensions.height}`,
    );
  }

  // Convert to PNG buffer (no file system)
  const pngBuffer = await Svg2(processedElement.outerHTML)
    .png({ transparent: false })
    .toBuffer();

  // Trace PNG back to SVG with potrace (merges elements into single path)
  const potraceResult = await Potrace(pngBuffer, { svgSize: scale });
  const tracedSvg = await potraceResult.trace();

  // Restore original attributes
  const tracedElement = Svg2(tracedSvg).toElement();
  const originalAttributes = getAttributes(rootElement);
  resetAttributes(tracedElement, originalAttributes);

  // Restore original path attributes if they exist
  const originalPath = getFirstPathElement(rootElement);
  const tracedPath = getFirstPathElement(tracedElement);

  if (originalPath && tracedPath) {
    const originalPathAttributes = getAttributes(originalPath);
    resetAttributes(tracedPath, originalPathAttributes);
  }

  // Return processed SVG as string
  return tracedElement.outerHTML;
}
