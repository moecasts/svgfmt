/**
 * Async transform function
 */
export default async function asyncTransform(svg) {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));
  return svg.replace(/<svg/, '<svg data-async="true"');
}
