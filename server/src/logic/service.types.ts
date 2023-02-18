export type AppConfig = {
  stripeChunkSize: number;
  hubspotChunkSize: number;
};

export interface IAccountTransferService {
  transfer(
    account_id: string,
    access_token: string,
    sync_run_id: number
  ): Promise<void>;
}
