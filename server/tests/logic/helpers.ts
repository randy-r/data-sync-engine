import { Knex } from 'knex';
import { UserAccountMap, UserAccountValue } from '../../src/data/domain.types';
import { IUserAccountsRepository } from '../../src/data/repository.types';
import { ITransactionManager } from '../../src/data/TransactionManager';

export class MockTransactionManager implements ITransactionManager {
  runAsTransaction<T>(
    toRun: (trx: Knex.Transaction<any, any[]>) => Promise<T>,
    config?: Knex.TransactionConfig | undefined
  ): Promise<T> {
    // Note: we don't care about the transaction object in mocks
    return toRun({} as Knex.Transaction<any, any[]>);
  }
}

const mockUserAccounts = new Map<string, UserAccountValue>([
  ['test-1', { service: 'stripe', access_token: 'at-1' }],
  ['test-3', { service: 'stripe', access_token: 'at-3' }],
]);

export class MockUserAccountRepo implements IUserAccountsRepository {
  async getAccounts(): Promise<UserAccountMap> {
    return mockUserAccounts;
  }
}
