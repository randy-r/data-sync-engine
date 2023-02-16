import { Knex } from 'knex';
import { StripeCustomer } from './domain.types';
import { ICustomersDbRepository } from './repository.types';

export class CustomersDbRepository implements ICustomersDbRepository {
  /**
   * Note: The amount of deleted records can be considerable,
   * thus this method returns only the count of the affected rows.
   */
  async clearCustomersForAccount(
    account_id: string,
    { trx }: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }> {
    const result = await trx.raw<{ rows: [{ count: string }] }>(
      `WITH deleted as (
        DELETE FROM public."stripe-customers" WHERE account_id = :account_id RETURNING id
      ) SELECT COUNT(*) FROM deleted;`,
      { account_id }
    );
    return { count: Number.parseInt(result.rows[0].count, 10) };
  }
  async insertCustomersForAccount(
    account_id: string,
    id: number,
    toInsert: StripeCustomer[],
    { trx }: { trx: Knex.Transaction<any, any[]> }
  ): Promise<StripeCustomer[]> {
    const chunkSize = toInsert.length; // Send as many as there are in one go
    const result = await trx
      .batchInsert('public.stripe-customers', toInsert, chunkSize)
      .returning(`*`);
    return result;
  }
}
