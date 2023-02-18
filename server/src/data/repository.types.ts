import {
  HubspotContact,
  HubspotDbContact,
  StripeCustomer,
  StripeDbCustomer,
  SyncRun,
  UserAccountMap,
} from './domain.types';
import type { Knex } from 'knex';
import { ForwardPaging } from '@hubspot/api-client/lib/codegen/crm/objects/';

export interface ISyncRunRepository {
  create(arg0: { trx: Knex.Transaction<any, any[]> }): Promise<SyncRun>;
  getLatest(config: { trx: Knex.Transaction }): Promise<SyncRun | null>;
}

export interface ISyncRunUpdateRepository {
  updateType(
    arg0: { id: number; type: 'done' | 'done-with-errors' },
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun>;
}

export interface IStripeRepository {
  getCustomers(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<{ data: StripeCustomer[]; has_more: boolean }>;
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
    toInsert: StripeDbCustomer[],
    arg3: { trx: Knex.Transaction<any, any[]> }
  ): Promise<StripeDbCustomer[]>;
}

export type HubspotRateLimit = {
  max: number;
  remaining: number;
  intervalMs: number;
};

export type GetHubspotContactsResponse = {
  results: HubspotContact[];
  paging?: ForwardPaging;
  rateLimit: HubspotRateLimit;
};

export interface IHubspotRepository {
  getContacts(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<GetHubspotContactsResponse>;
}

export interface IContactsDbRepository {
  clearContactsForAccount(
    account_id: string,
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }>;
  insertContactsForAccount(
    account_id: string,
    sync_run_id: number,
    toInsert: HubspotDbContact[],
    arg3: { trx: Knex.Transaction<any, any[]> }
  ): Promise<HubspotDbContact[]>;
}
