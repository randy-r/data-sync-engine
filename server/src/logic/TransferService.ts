import { SyncRun, UserAccountMap } from '../data/domain.types';
import {
  IStripeRepository,
  ISyncRunRepository,
  IUserAccountsRepository,
} from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';

export class TransferService {
  private syncRunRepo: ISyncRunRepository;
  private tm: ITransactionManager;
  private stripeRepo: IStripeRepository;
  private userAccountsRepo: IUserAccountsRepository;

  constructor(
    syncRunRepo: ISyncRunRepository,
    transactionManager: ITransactionManager,
    stripeRepo: IStripeRepository,
    userAccountsRepo: IUserAccountsRepository
  ) {
    this.syncRunRepo = syncRunRepo;
    this.stripeRepo = stripeRepo;
    this.tm = transactionManager;
    this.userAccountsRepo = userAccountsRepo;
  }
  async transfer(syncRun: SyncRun): Promise<void> {
    try {
      this.tm.runAsTransaction(async (trx) => {
        const userAccounts: UserAccountMap =
          await this.userAccountsRepo.getAccounts();

        // TODO possibility to send multiple requests to 3rd parties at once
        for (const [account_id, value] of userAccounts.entries()) {
          switch (value.service) {
            case 'stripe': {
              const stripeCustomers = await this.stripeRepo.getCustomers(
                value.access_token
              );
              console.log(stripeCustomers);
              break;
            }

            default:
              break;
          }
        }

        // mark as done after all the logic has finished
        const updatedRun: SyncRun = await this.syncRunRepo.updateType(
          { id: syncRun.id, type: 'done' },
          { trx }
        );
        return updatedRun;
      });
    } catch (e) {
      console.error(e);
      // TODO maybe save in db
    }
  }
}
