export function buildCombinationHash(attributeValueIds: string[]): string {
  return [...attributeValueIds].sort().join('_');
}
