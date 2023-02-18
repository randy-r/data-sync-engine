import { StripeDbCustomer } from '../data/domain.types';
import {
  ICustomersDbRepository,
  IStripeRepository,
} from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { mapStripeResponseToDomainCustomer } from './mappers';
import { AppConfig, IAccountTransferService } from './service.types';

export class StripeTransferService implements IAccountTransferService {
  private tm: ITransactionManager;
  private config: AppConfig;

  private customersDbRepo: ICustomersDbRepository;
  private stripeRepo: IStripeRepository;

  constructor(
    transactionManager: ITransactionManager,
    stripeRepo: IStripeRepository,
    customersDbRepo: ICustomersDbRepository,
    config: AppConfig
  ) {
    this.stripeRepo = stripeRepo;
    this.tm = transactionManager;
    this.config = config;
    this.customersDbRepo = customersDbRepo;
  }

  async transfer(
    account_id: string,
    access_token: string,
    sync_run_id: number
  ): Promise<void> {
    // each account sync is a transaction, continue on error, the old entries will be the shown by having a different sync run id
    await this.tm.runAsTransaction(async (trx) => {
      let starting_after: string | undefined;
      let hasMore = true;
      await this.customersDbRepo.clearCustomersForAccount(account_id, {
        trx,
      });

      while (hasMore) {
        // Note: stripe's auto pagination is cool but harder to mock, going with on a more vanilla route
        const customersResponse = await this.stripeRepo.getCustomers(
          access_token,
          { limit: this.config.stripeChunkSize, starting_after }
        );

        const { data, has_more } = customersResponse;
        const toInsert: StripeDbCustomer[] = data.map((c) =>
          mapStripeResponseToDomainCustomer(c, account_id, sync_run_id)
        );
        await this.customersDbRepo.insertCustomersForAccount(
          account_id,
          sync_run_id,
          toInsert,
          { trx }
        );
        hasMore = has_more;
        starting_after = data.at(-1).id;
      } // while
    });
  }
}
