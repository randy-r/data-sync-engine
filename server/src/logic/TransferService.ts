import { SyncRun } from '../data/domain.types';
import {
  ISyncRunUpdateRepository,
  IUserAccountsRepository,
} from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { IAccountTransferService } from './service.types';

export class TransferService {
  private syncRunRepo: ISyncRunUpdateRepository;
  private tm: ITransactionManager;
  private userAccountsRepo: IUserAccountsRepository;

  private stripeTransferService: IAccountTransferService;
  private hubspotTransferService: IAccountTransferService;

  constructor(
    syncRunRepo: ISyncRunUpdateRepository,
    transactionManager: ITransactionManager,
    userAccountsRepo: IUserAccountsRepository,
    stripeTransferService: IAccountTransferService,
    hubspotTransferService: IAccountTransferService
  ) {
    this.syncRunRepo = syncRunRepo;
    this.tm = transactionManager;
    this.userAccountsRepo = userAccountsRepo;
    this.stripeTransferService = stripeTransferService;
    this.hubspotTransferService = hubspotTransferService;
  }
  async transfer(syncRun: SyncRun): Promise<void> {
    try {
      const userAccounts = await this.userAccountsRepo.getAccounts();
      const errors: any[] = [];
      // TODO possibility to send multiple requests to 3rd parties at once
      for (const [account_id, value] of userAccounts.entries()) {
        try {
          switch (value.service) {
            case 'stripe': {
              await this.stripeTransferService.transfer(
                account_id,
                value.access_token,
                syncRun.id
              );
              break;
            }
            case 'hubspot': {
              await this.hubspotTransferService.transfer(
                account_id,
                value.access_token,
                syncRun.id
              );
              break;
            }

            default:
              break;
          } // switch
        } catch (e) {
          errors.push(e);
          // TODO opportunity to save this in the db and perform retries after the main run
          console.error(
            `Error when performing synchronization for account_id: "${account_id}", service: "${value.service}", continuing to next account..."`,
            e.name,
            e.message
          );
        }
      }
      await this.updateRunType({
        id: syncRun.id,
        type: errors.length ? 'done-with-errors' : 'done',
      });
    } catch (e) {
      console.error(e);
      await this.updateRunType({ id: syncRun.id, type: 'done-with-errors' });
    }
  } // transfer

  private updateRunType(args: {
    id: number;
    type: 'done' | 'done-with-errors';
  }) {
    return this.tm.runAsTransaction(async (trx) => {
      return this.syncRunRepo.updateType(args, { trx });
    });
  }
}
