/**
 * Transform with named export
 */
export function transform(svg) {
  return svg.replace(/<svg/, '<svg data-transformed="true"');
}
