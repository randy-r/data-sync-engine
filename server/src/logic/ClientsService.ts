import { buildClientsQuery } from '../data/build-clients-query';
import { TransactionManager } from '../data/TransactionManager';
import { validateNonEmptyString } from '../utils/misc';

export class ClientsService {
  private tm: TransactionManager;
  constructor(tm: TransactionManager) {
    this.tm = tm;
  }

  // TODO types, and in general actual SQL statements should be in repositories
  async getClients(filters?: { emailSearch?: string; account_id: string }) {
    if (filters?.account_id) {
      validateNonEmptyString(filters.account_id);
    }
    if (filters?.emailSearch) {
      validateNonEmptyString(filters.emailSearch);
    }

    const query = buildClientsQuery(filters);
    const result = await this.tm.runAsTransaction<{ rows: any }>((trx) => {
      return trx.raw(query);
    });

    return result.rows;
  }
}
