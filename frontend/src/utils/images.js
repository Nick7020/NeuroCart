/**
 * Returns the image URL at `index` from the images array.
 * Falls back to a branded placeholder if missing.
 */
export function getProductImage(images, index = 0) {
  return images?.[index] || `https://placehold.co/400x400/f0f4ff/1A3263?text=NeuroCart`
}
