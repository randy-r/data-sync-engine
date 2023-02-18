import { expect, jest, test, describe, it } from '@jest/globals';
import { Knex } from 'knex';
import {
  HubspotDbContact,
  StripeCustomer,
  StripeDbCustomer,
  SyncRun,
  SyncRunInProgress,
} from '../../src/data/domain.types';
import {
  IStripeRepository,
  ISyncRunUpdateRepository,
  ICustomersDbRepository,
  IContactsDbRepository,
  IHubspotRepository,
  GetHubspotContactsResponse,
} from '../../src/data/repository.types';
import { TransferService } from '../../src/logic/TransferService';
import { StripeTransferService } from '../../src/logic/StripeTransferService';
import { HubspotTransferService } from '../../src/logic/HubspotTransferService';

import { MockTransactionManager, MockUserAccountRepo } from './helpers';
import { Throttler } from '../../src/logic/Throttler';
import { AppConfig } from '../../src/logic/service.types';

const CURRENT_SYNC_RUN: SyncRunInProgress = {
  type: 'in-progress',
  started_at: '2023-02-17T12:01:00.992Z',
  finished_at: null,
  id: 1,
};

export class MockSyncRunUpdateRepository implements ISyncRunUpdateRepository {
  finished_at = '2023-02-17T12:02:00.992Z';
  async updateType(
    arg0: { id: number; type: 'done' | 'done-with-errors' },
    _: { trx: Knex.Transaction<any, any[]> }
  ): Promise<SyncRun> {
    return {
      ...CURRENT_SYNC_RUN,
      ...arg0,
      finished_at: this.finished_at,
    };
  }
}

export class MockStripeRepo implements IStripeRepository {
  async getCustomers(
    access_token: string,
    params?:
      | { limit?: number | undefined; starting_after?: string | undefined }
      | undefined
  ): Promise<{ data: StripeCustomer[]; has_more: boolean }> {
    return {
      has_more: false,
      data: [
        {
          id: `id__${access_token}`,
          description: 'desc',
          email: 'email',
          name: 'name',
          created: 1676639395,
        },
      ],
    };
  }
}

export class MockCustomersDbRepository implements ICustomersDbRepository {
  async clearCustomersForAccount(
    account_id: string,
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }> {
    return { count: 10 };
  }
  async insertCustomersForAccount(
    account_id: string,
    id: number,
    toInsert: StripeDbCustomer[],
    arg3: { trx: Knex.Transaction<any, any[]> }
  ): Promise<StripeDbCustomer[]> {
    return toInsert;
  }
}

export class MockHubspotRepository implements IHubspotRepository {
  async getContacts(
    access_token: string,
    params?:
      | { limit?: number | undefined; starting_after?: string | undefined }
      | undefined
  ): Promise<GetHubspotContactsResponse> {
    return {
      results: [
        {
          id: `id__${access_token}`,
          properties: {
            createdate: '2024-02-17T13:09:55.000Z',
            email: 'email',
            firstname: 'firstname',
            lastname: 'lastname',
          },
        },
      ],
      rateLimit: {
        intervalMs: 10_000,
        max: 100,
        remaining: 99,
      },
    };
  }
}

class MockContactsDbRepo implements IContactsDbRepository {
  async clearContactsForAccount(
    account_id: string,
    arg1: { trx: Knex.Transaction<any, any[]> }
  ): Promise<{ count: number }> {
    return { count: 10 };
  }
  async insertContactsForAccount(
    account_id: string,
    sync_run_id: number,
    toInsert: HubspotDbContact[],
    arg3: { trx: Knex.Transaction<any, any[]> }
  ): Promise<HubspotDbContact[]> {
    return toInsert;
  }
}

const mockTm = new MockTransactionManager();

const config: AppConfig = {
  hubspotChunkSize: 1,
  stripeChunkSize: 1,
  syncAllowedIntervalMs: 1000,
};

describe('TransferService', () => {
  // arrange
  const customersDbRepo = new MockCustomersDbRepository();
  const mockedCustomerClear = jest.spyOn(
    customersDbRepo,
    'clearCustomersForAccount'
  );
  const mockedCustomerInsert = jest.spyOn(
    customersDbRepo,
    'insertCustomersForAccount'
  );
  const contactsDbRepo = new MockContactsDbRepo();
  const mockedContactClear = jest.spyOn(
    contactsDbRepo,
    'clearContactsForAccount'
  );
  const mockedContactInsert = jest.spyOn(
    contactsDbRepo,
    'insertContactsForAccount'
  );

  const s = new TransferService(
    new MockSyncRunUpdateRepository(),
    new MockTransactionManager(),
    new MockUserAccountRepo(),
    new StripeTransferService(
      mockTm,
      new MockStripeRepo(),
      customersDbRepo,
      config
    ),
    new HubspotTransferService(
      new MockHubspotRepository(),
      contactsDbRepo,
      mockTm,
      new Throttler(),
      config
    )
  );

  it('transfers all entries from 3rd parties to db', async () => {
    // act
    await s.transfer(CURRENT_SYNC_RUN);
    // assert

    // Stripe part
    expect(mockedCustomerClear).toBeCalledTimes(2);
    const insertCustomersDbCalls = mockedCustomerInsert.mock.calls;
    expect(insertCustomersDbCalls.length).toBe(2);
    // assert what values are produced and passed forwards to the db
    expect(insertCustomersDbCalls[0][2]).toEqual([
      {
        id: 'id__at-1',
        account_id: 'test-1',
        created_at: '2023-02-17T13:09:55.000Z',
        description: 'desc',
        email: 'email',
        name: 'name',
        sync_run_id: CURRENT_SYNC_RUN.id,
      },
    ]);
    expect(insertCustomersDbCalls[1][2]).toEqual([
      {
        id: 'id__at-3',
        account_id: 'test-3',
        created_at: '2023-02-17T13:09:55.000Z',
        description: 'desc',
        email: 'email',
        name: 'name',
        sync_run_id: CURRENT_SYNC_RUN.id,
      },
    ]);

    // Hubspot part
    expect(mockedContactClear).toBeCalledTimes(1);
    const insertContactDbCalls = mockedContactInsert.mock.calls;
    expect(insertContactDbCalls.length).toBe(1);
    // assert what values are produced and passed forwards to the db
    expect(insertContactDbCalls[0][2]).toEqual([
      {
        id: 'id__at-2',
        account_id: 'test-2',
        created_at: '2024-02-17T13:09:55.000Z',
        email: 'email',
        first_name: 'firstname',
        last_name: 'lastname',
        sync_run_id: CURRENT_SYNC_RUN.id,
      },
    ]);
  });
});
