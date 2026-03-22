import { expect, it } from 'vitest'

it('bff-handler exports bffGet and bffMutate', async () => {
  const mod = await import('./bff-handler')
  expect(typeof mod.bffGet).toBe('function')
  expect(typeof mod.bffMutate).toBe('function')
})
