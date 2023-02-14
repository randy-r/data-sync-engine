import { SyncRun } from '../data/domain.types';
import { ISyncRunRepository } from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { delay } from '../utils/misc';

// const SYNC_ALLOWED_INTERVAL_MS = 60 * 60 * 1000;
const SYNC_ALLOWED_INTERVAL_MS = 5_000;

export class SyncService {
  syncRunRepo: ISyncRunRepository;
  tm: ITransactionManager;
  constructor(
    syncRunRepo: ISyncRunRepository,
    transactionManager: ITransactionManager
  ) {
    this.syncRunRepo = syncRunRepo;
    this.tm = transactionManager;
  }
  async performSynchronization(): Promise<SyncRun> {
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

    if (isNew)
      // fire and forget
      this.transferData(syncRun);

    return syncRun;
  }

  async transferData(syncRun: SyncRun): Promise<void> {
    try {
      this.tm.runAsTransaction(async (trx) => {
        // TODO logic
        delay(5_000);

        const updatedRun: SyncRun = await this.syncRunRepo.updateType(
          { id: syncRun.id, type: 'done' },
          { trx }
        );
      });
    } catch (e) {
      // TODO maybe save in db
    }
  }

  async jestTest(): Promise<boolean> {
    return true;
  }
}
