import { SyncRun, UserAccountMap } from './domain.types';
import type { Knex } from 'knex';

export interface ISyncRunRepository {
  updateType(
    arg0: { id: number; type: SyncRun['type'] },
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun>;
  create(arg0: { trx: Knex.Transaction<any, any[]> }): Promise<SyncRun>;
  getLatest(config: { trx: Knex.Transaction }): Promise<SyncRun | null>;
}

export interface IStripeRepository {
  getCustomers(access_token: string): Promise<any>;
}

export interface IUserAccountsRepository {
  getAccounts(): Promise<UserAccountMap>;
}
