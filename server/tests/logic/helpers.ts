import { Knex } from 'knex';
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
