export type SyncRunDone = {
  id: number;
  type: 'done';
  started_at: string;
  finished_at: null | string;
};

export type SyncRunDoneWithErrors = {
  id: number;
  type: 'done-with-errors';
  started_at: string;
  finished_at: null | string;
};

export type SyncRunInProgress = {
  id: number;
  type: 'in-progress';
  started_at: string;
  finished_at: null | string;
};

export type SyncRun = SyncRunDone | SyncRunInProgress | SyncRunDoneWithErrors;

export type UserAccountValue = {
  service: 'stripe' | 'hubspot';
  access_token: string;
};

export type UserAccountMap = Map<string, UserAccountValue>;

// Projection of StripeCustomer
export type StripeCustomer = {
  id: string;
  name?: string;
  description?: string;
  email?: string;
  created: number;
};

export type StripeDbCustomer = {
  id: string;
  name?: string;
  description?: string;
  email?: string;
  account_id: string;
  created_at: string;
  sync_run_id: number;
};
