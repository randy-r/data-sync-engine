import { expect, jest, test, describe, it } from '@jest/globals';
import { Knex } from 'knex';
import { SyncRun } from '../../src/data/domain.types';
import { ISyncRunRepository } from '../../src/data/repository.types';
import { SyncRunService } from '../../src/logic/SyncRunService';
import { MockTransactionManager } from './helpers';

const TIMESTAMP = new Date().toISOString();

class CreateCallMockSyncRunRepository implements ISyncRunRepository {
  async create(config: {
    trx: Knex.Transaction<any, any[]>;
  }): Promise<SyncRun> {
    return {
      id: 1,
      started_at: TIMESTAMP,
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
  override async getLatest(config: {
    trx: Knex.Transaction<any, any[]>;
  }): Promise<SyncRun | null> {
    return {
      id: 2,
      started_at: TIMESTAMP,
      finished_at: null,
      type: 'in-progress',
    };
  }
}

describe('SyncRunService', () => {
  it('creates new run when none exist', async () => {
    const mockRepo = new CreateCallMockSyncRunRepository();
    const s = new SyncRunService(mockRepo, new MockTransactionManager(), {
      syncAllowedIntervalMs: 1000,
    });
    const r = await s.createIfFinished();
    expect(r.syncRun.id).toBe(1);
    expect(r.syncRun.type).toBe('in-progress');
    expect(r.isNew).toBe(true);
  });

  it('returns latest when it exists', async () => {
    const mockRepo = new GetLatestCallMockSyncRunRepository();
    const s = new SyncRunService(mockRepo, new MockTransactionManager(), {
      syncAllowedIntervalMs: 1000,
    });
    const r = await s.createIfFinished();
    expect(r.syncRun.id).toBe(2);
    expect(r.syncRun.type).toBe('in-progress');
    expect(r.isNew).toBe(false);
  });
});
