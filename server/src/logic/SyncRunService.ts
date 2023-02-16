import { SyncRun } from '../data/domain.types';
import { ISyncRunRepository } from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';

// const SYNC_ALLOWED_INTERVAL_MS = 60 * 60 * 1000;
const SYNC_ALLOWED_INTERVAL_MS = 5_000;

export class SyncRunService {
  syncRunRepo: ISyncRunRepository;
  tm: ITransactionManager;
  constructor(
    syncRunRepo: ISyncRunRepository,
    transactionManager: ITransactionManager
  ) {
    this.syncRunRepo = syncRunRepo;
    this.tm = transactionManager;
  }
  async createIfFinished(): Promise<{ isNew: boolean; syncRun: SyncRun }> {
    const { isNew, syncRun } = await this.tm.runAsTransaction(async (trx) => {
      let r = await this.syncRunRepo.getLatest({ trx });
      let isNew = false;

      // start a new run when there is none or the other has finished
      if (r === null) {
        r = await this.syncRunRepo.create({ trx });
        isNew = true;
      } else if (r.finished_at !== null) {
        const finished = new Date(r.finished_at);
        const now = new Date();

        if (now.getTime() - finished.getTime() > SYNC_ALLOWED_INTERVAL_MS) {
          r = await this.syncRunRepo.create({ trx });
        }
      }
      return { isNew, syncRun: r };
    });

    return { isNew, syncRun };
  }
}
