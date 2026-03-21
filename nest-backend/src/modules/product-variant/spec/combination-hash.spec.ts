import { buildCombinationHash } from '../utils/combination-hash';

describe('buildCombinationHash', () => {
  it('sorts UUIDs lexicographically and joins with _', () => {
    const ids = ['c-uuid', 'a-uuid', 'b-uuid'];
    expect(buildCombinationHash(ids)).toBe('a-uuid_b-uuid_c-uuid');
  });

  it('single value returns just that value', () => {
    expect(buildCombinationHash(['x-uuid'])).toBe('x-uuid');
  });

  it('same IDs in different order produce same hash', () => {
    const a = buildCombinationHash(['z', 'a', 'm']);
    const b = buildCombinationHash(['m', 'z', 'a']);
    expect(a).toBe(b);
  });

  it('does not mutate the input array', () => {
    const ids = ['z', 'a'];
    buildCombinationHash(ids);
    expect(ids).toEqual(['z', 'a']);
  });

  it('returns a stable string for an empty array of IDs', () => {
    const result = buildCombinationHash([]);
    expect(typeof result).toBe('string');
    // calling twice is deterministic
    expect(buildCombinationHash([])).toBe(result);
  });
});
