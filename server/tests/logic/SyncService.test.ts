import { SyncService } from '../../src/logic/SyncService';

describe('SyncService', () => {
  it('return correct value from jestTest', async () => {
    const s = new SyncService();
    const r = await s.jestTest();

    expect(r).toBe(true);
  });
});
