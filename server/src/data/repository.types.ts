import { StripeCustomer, SyncRun, UserAccountMap } from './domain.types';
import type { Knex } from 'knex';
import Stripe from 'stripe';

export interface ISyncRunRepository {
  updateType(
    arg0: { id: number; type: 'done' | 'done-with-errors' },
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun>;
  create(arg0: { trx: Knex.Transaction<any, any[]> }): Promise<SyncRun>;
  getLatest(config: { trx: Knex.Transaction }): Promise<SyncRun | null>;
}

export interface IStripeRepository {
  getCustomers(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<{ data: Stripe.Customer[]; has_more: boolean }>;
}

export interface IUserAccountsRepository {
  getAccounts(): Promise<UserAccountMap>;
}

export interface ICustomersDbRepository {
  clearCustomersForAccount(
    account_id: string,
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }>;
  insertCustomersForAccount(
    account_id: string,
    id: number,
    toInsert: StripeCustomer[],
    arg3: { trx: Knex.Transaction<any, any[]> }
  ): Promise<StripeCustomer[]>;
}
