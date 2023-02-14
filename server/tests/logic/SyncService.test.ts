import { Knex } from 'knex';
import { SyncRun } from '../../src/data/domain.types';
import { ISyncRunRepository } from '../../src/data/repository.types';
import { SyncService } from '../../src/logic/SyncService';
import { MockTransactionManager } from './helpers';

class CreateCallMockSyncRunRepository implements ISyncRunRepository {
  public started_at = `2023-02-14T13:00:00.000Z`;
  public finished_at = `2023-02-14T13:00:00.000Z`;
  async updateType(
    data: { id: number; type: SyncRun['type'] },
    options: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun> {
    return {
      started_at: this.started_at,
      finished_at: this.finished_at,
      ...data,
    };
  }
  async create(config: { trx: Knex.Transaction<any, any[]> }): Promise<SyncRun> {
    return {
      id: 1,
      started_at: this.started_at,
      finished_at: null,
      type: 'in-progress',
    };
  }
  async getLatest(config: {
    trx: Knex.Transaction<any, any[]>;
  }): Promise<SyncRun | null> {
    return null;
  }
}

class GetLatestCallMockSyncRunRepository extends CreateCallMockSyncRunRepository {
  override async getLatest(config: { trx: Knex.Transaction<any, any[]>; }): Promise<SyncRun | null> {
    return {
      id: 2,
      started_at: this.started_at,
      finished_at: null,
      type: 'in-progress',
    };
  }
}

describe('SyncService', () => {
  it('return correct value from jestTest', async () => {
    const s = new SyncService(
      new CreateCallMockSyncRunRepository(),
      new MockTransactionManager()
    );
    const r = await s.jestTest();
    expect(r).toBe(true);
  });

  it('creates new run when none exist', async () => {
    const mockRepo = new CreateCallMockSyncRunRepository();
    const s = new SyncService(
      mockRepo,
      new MockTransactionManager()
    );
    const r = await s.performSynchronization();
    expect(r.id).toBe(1);
    expect(r.type).toBe('in-progress');
  });

  it('returns latest when it exists', async () => {
    const mockRepo = new GetLatestCallMockSyncRunRepository();
    const s = new SyncService(
      mockRepo,
      new MockTransactionManager()
    );
    const r = await s.performSynchronization();
    expect(r.id).toBe(2);
    expect(r.type).toBe('in-progress');
  });

  it('returns latest when it exists', async () => {
    const mockRepo = new GetLatestCallMockSyncRunRepository();
    const s = new SyncService(
      mockRepo,
      new MockTransactionManager()
    );
    const r = await s.performSynchronization();
    expect(r.id).toBe(2);
    expect(r.type).toBe('in-progress');
  });
});
