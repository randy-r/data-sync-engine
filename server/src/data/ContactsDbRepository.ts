import { Knex } from 'knex';
import { HubspotDbContact } from './domain.types';
import { IContactsDbRepository } from './repository.types';

export class ContactsDbRepository implements IContactsDbRepository {
  async clearContactsForAccount(
    account_id: string,
    { trx }: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }> {
    const result = await trx.raw<{ rows: [{ count: string }] }>(
      `WITH deleted as (
        DELETE FROM public."hubspot-contacts" WHERE account_id = :account_id RETURNING id
      ) SELECT COUNT(*) FROM deleted;`,
      { account_id }
    );
    return { count: Number.parseInt(result.rows[0].count, 10) };
  }
  async insertContactsForAccount(
    account_id: string,
    sync_run_id: number,
    toInsert: HubspotDbContact[],
    { trx }: { trx: Knex.Transaction<any, any[]> }
  ): Promise<HubspotDbContact[]> {
    const chunkSize = toInsert.length; // Send as many as there are in one go
    const result = await trx
      .batchInsert('public.hubspot-contacts', toInsert, chunkSize)
      .returning(`*`);
    return result;
  }
}
