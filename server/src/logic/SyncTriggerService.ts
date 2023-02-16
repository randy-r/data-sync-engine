import { SyncRun } from '../data/domain.types';
import { SyncRunService } from './SyncRunService';
import { TransferService } from './TransferService';

export class SyncTriggerService {
  private syncRunService: SyncRunService;
  private transferService: TransferService;
  constructor(
    syncRunService: SyncRunService,
    transferService: TransferService
  ) {
    this.syncRunService = syncRunService;
    this.transferService = transferService;
  }
  async triggerSync(): Promise<SyncRun> {
    const { isNew, syncRun } = await this.syncRunService.createIfFinished();
    if (isNew) {
      // fire and forget
      this.transferService.transfer(syncRun);
    }

    return syncRun;
  }
}
