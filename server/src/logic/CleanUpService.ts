import { ITransactionManager } from '../data/TransactionManager';

export class CleanUpService {
  private tm: ITransactionManager;

  constructor(tm: ITransactionManager) {
    this.tm = tm;
  }
  /**
   * TODO cleanup of stale runs should be done per an instance id, or else one process will clean the run of another
   */
  async cleanUpHangingSyncRuns(): Promise<void> {
    await this.tm.runAsTransaction((trx) => {
      return trx.raw(`
        UPDATE public."sync-runs"
        SET type = 'done-with-errors', finished_at = NOW()
        WHERE type = 'in-progress';
      `);
    });
  }
}
