import { UserAccountMap } from './domain.types';
import { IUserAccountsRepository } from './repository.types';
import { userAccounts } from './user-accounts';

export class UserAccountsRepository implements IUserAccountsRepository {
  async getAccounts(): Promise<UserAccountMap> {
    // these are defined in a file currently but they could be persisted anywhere, hence a repo interface before them
    return userAccounts;
  }
}
