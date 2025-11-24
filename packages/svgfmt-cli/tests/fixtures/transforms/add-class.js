/**
 * Transform that adds a custom class to the SVG root element
 */
export default function addClassTransform(svg) {
  return svg.replace(/<svg/, '<svg class="custom-icon"');
}
