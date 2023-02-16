import { Knex } from 'knex';
import { SyncRun } from './domain.types';
import { ISyncRunRepository } from './repository.types';

export class SyncRunRepository implements ISyncRunRepository {
  async updateType(
    data: { id: number; type: 'done' | 'done-with-errors' },
    { trx }: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun> {
    const r = await trx.raw<{ rows: SyncRun[] }>(
      `
    UPDATE public."sync-runs"
    SET "type" = :type, finished_at = NOW() 
    WHERE id = :id
    RETURNING id, started_at, finished_at, "type";
    `,
      data
    );
    return r.rows[0];
  }
  async create({
    trx,
  }: {
    trx: Knex.Transaction<any, any[]>;
  }): Promise<SyncRun> {
    const r = await trx.raw<{ rows: SyncRun[] }>(`
    INSERT INTO public."sync-runs" 
    (finished_at, "type")
    VALUES (NULL, 'in-progress')
    RETURNING "id", "started_at", "finished_at", "type";
    `);
    return r.rows[0];
  }
  async getLatest({
    trx,
  }: {
    trx: Knex.Transaction<any, any[]>;
  }): Promise<SyncRun | null> {
    const r = await trx.raw<{ rows: SyncRun[] }>(`
    SELECT "id", "started_at", "finished_at", "type" FROM public."sync-runs" 
    ORDER BY finished_at DESC
    LIMIT 1;
    `);
    return r.rows?.[0] ?? null;
  }
}
