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


