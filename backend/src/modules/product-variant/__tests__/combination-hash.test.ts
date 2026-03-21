import { buildCombinationHash } from '../combination-hash';

describe('buildCombinationHash', () => {
  it('sorts ids ascending and joins with underscore', () => {
    expect(buildCombinationHash([3, 1])).toBe('1_3');
  });
  it('is order-independent', () => {
    expect(buildCombinationHash([1, 3])).toBe(buildCombinationHash([3, 1]));
  });
  it('handles single attribute value', () => {
    expect(buildCombinationHash([5])).toBe('5');
  });
  it('handles three values', () => {
    expect(buildCombinationHash([10, 2, 7])).toBe('2_7_10');
  });
});
