/**
 * Builds a deterministic combination hash from attribute value IDs.
 * Sorted ascending by value ID.
 * Example: [3, 1] → "1_3"
 */
export function buildCombinationHash(attributeValueIds: number[]): string {
  return [...attributeValueIds].sort((a, b) => a - b).join('_');
}
