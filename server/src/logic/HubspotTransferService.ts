import {
  IContactsDbRepository,
  IHubspotRepository,
} from '../data/repository.types';
import { ITransactionManager } from '../data/TransactionManager';
import { mapHubspotResponseToDomainContact } from './mappers';
import { AppConfig, IAccountTransferService } from './service.types';

export class HubspotTransferService implements IAccountTransferService {
  private hubspotRepo: IHubspotRepository;
  private contactsDbRepo: IContactsDbRepository;
  private config: AppConfig;
  private tm: ITransactionManager;
  constructor(
    hubspotRepo: IHubspotRepository,
    contactsDbRepo: IContactsDbRepository,
    tm: ITransactionManager,
    config: AppConfig
  ) {
    this.hubspotRepo = hubspotRepo;
    this.contactsDbRepo = contactsDbRepo;
    this.config = config;
    this.tm = tm;
  }
  async transfer(
    account_id: string,
    access_token: string,
    sync_run_id: number
  ): Promise<void> {
    await this.tm.runAsTransaction(async (trx) => {
      let starting_after: string | undefined;
      let hasMore = true;
      await this.contactsDbRepo.clearContactsForAccount(account_id, {
        trx,
      });

      // note: starting after is inclusive
      while (hasMore) {
        const contactsResponse = await this.hubspotRepo.getContacts(
          access_token,
          {
            limit: this.config.hubspotChunkSize,
            starting_after,
          }
        );
        hasMore = !!contactsResponse.paging?.next;
        starting_after = contactsResponse.paging?.next?.after;
        const toInsert = contactsResponse.results.map((c) =>
          mapHubspotResponseToDomainContact(c, account_id, sync_run_id)
        );

        await this.contactsDbRepo.insertContactsForAccount(
          account_id,
          sync_run_id,
          toInsert,
          { trx }
        );
      } // while
    });
  }
}
