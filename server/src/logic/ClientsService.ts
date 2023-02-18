import { TransactionManager } from '../data/TransactionManager';

export class ClientsService {
  private tm: TransactionManager;
  constructor(tm: TransactionManager) {
    this.tm = tm;
  }

  // TODO types, and in general actual SQL statements should be in repositories
  async getClients() {
    const result = await this.tm.runAsTransaction<{ rows: any }>((trx) => {
      return trx.raw(`
      SELECT
        u.*,
        sr.finished_at synced_at
      FROM
        (
          SELECT
            id,
            email,
            name,
            created_at,
            sync_run_id,
            'stripe' AS source
          FROM
            public."stripe-customers"
          UNION
          ALL
          SELECT
            id,
            email,
            CASE
              TRIM(CONCAT("first_name", ' ', "last_name"))
              WHEN '' THEN NULL
              ELSE TRIM(CONCAT("first_name", ' ', "last_name"))
            END AS name,
            created_at,
            sync_run_id,
            'hubspot' AS source
          FROM
            public."hubspot-contacts"
        ) u
        INNER JOIN public."sync-runs" sr ON sr.id = u.sync_run_id
      `);
    });

    return result.rows;
  }
}
