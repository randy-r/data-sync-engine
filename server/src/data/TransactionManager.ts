import type { Knex } from 'knex';

export interface ITransactionManager {
  runAsTransaction<T>(
    toRun: (trx: Knex.Transaction) => Promise<T>,
    config?: Knex.TransactionConfig
  ): Promise<T>;
}

export class TransactionManager implements ITransactionManager {
  private knex: Knex;
  constructor(knex: Knex) {
    this.knex = knex;
  }
  runAsTransaction<T>(
    toRun: (trx: Knex.Transaction) => Promise<T>,
    config?: Knex.TransactionConfig
  ) {
    return this.knex.transaction(toRun, config);
  }
}
