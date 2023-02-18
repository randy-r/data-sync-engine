import { SyncRun } from '../data/domain.types';
import { ISyncRunRepository } from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { AppConfig } from './service.types';

export class SyncRunService {
  private syncRunRepo: ISyncRunRepository;
  private tm: ITransactionManager;
  private config: AppConfig;
  constructor(
    syncRunRepo: ISyncRunRepository,
    transactionManager: ITransactionManager,
    config: AppConfig
  ) {
    this.syncRunRepo = syncRunRepo;
    this.tm = transactionManager;
    this.config = config;
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

        if (
          now.getTime() - finished.getTime() >
          this.config.syncAllowedIntervalMs
        ) {
          isNew = true;
          r = await this.syncRunRepo.create({ trx });
        }
      }
      return { isNew, syncRun: r };
    });

    return { isNew, syncRun };
  }
}
