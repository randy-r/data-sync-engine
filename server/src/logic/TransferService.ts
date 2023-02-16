import { StripeCustomer, SyncRun, UserAccountMap } from '../data/domain.types';
import {
  ICustomersDbRepository,
  IStripeRepository,
  ISyncRunRepository,
  IUserAccountsRepository,
} from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { mapStripeResponseToDomainCustomer } from './mappers';

export type TransferServiceConfig = {
  stripeChunkService: number;
};

export class TransferService {
  private syncRunRepo: ISyncRunRepository;
  private tm: ITransactionManager;
  private stripeRepo: IStripeRepository;
  private userAccountsRepo: IUserAccountsRepository;
  private config: TransferServiceConfig;
  private customersDbRepo: ICustomersDbRepository;

  constructor(
    syncRunRepo: ISyncRunRepository,
    transactionManager: ITransactionManager,
    stripeRepo: IStripeRepository,
    userAccountsRepo: IUserAccountsRepository,
    customersDbRepo: ICustomersDbRepository,
    config: TransferServiceConfig
  ) {
    this.syncRunRepo = syncRunRepo;
    this.stripeRepo = stripeRepo;
    this.tm = transactionManager;
    this.userAccountsRepo = userAccountsRepo;
    this.config = config;
    this.customersDbRepo = customersDbRepo;
  }
  async transfer(syncRun: SyncRun): Promise<void> {
    try {
      const userAccounts: UserAccountMap =
        await this.userAccountsRepo.getAccounts();
      const errors: any[] = [];
      // TODO possibility to send multiple requests to 3rd parties at once
      for (const [account_id, value] of userAccounts.entries()) {
        try {
          switch (value.service) {
            case 'stripe': {
              // each account sync is a transaction, continue on error, the old entries will be the shown by having a different sync run id
              await this.tm.runAsTransaction(async (trx) => {
                let starting_after: string | undefined;
                let hasMore = true;
                await this.customersDbRepo.clearCustomersForAccount(
                  account_id,
                  {
                    trx,
                  }
                );

                while (hasMore) {
                  // Note: stripe's auto pagination is cool but harder to mock, going with on a more vanilla route
                  const customersResponse = await this.stripeRepo.getCustomers(
                    value.access_token,
                    { limit: this.config.stripeChunkService, starting_after }
                  );

                  const { data, has_more } = customersResponse;
                  const toInsert: StripeCustomer[] = data.map((c) =>
                    mapStripeResponseToDomainCustomer(c, account_id, syncRun.id)
                  );
                  await this.customersDbRepo.insertCustomersForAccount(
                    account_id,
                    syncRun.id,
                    toInsert,
                    { trx }
                  );
                  hasMore = has_more;
                  starting_after = data.at(-1).id;
                }
              });
            }

            default:
              break;
          } // switch
        } catch (e) {
          errors.push(e);
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
