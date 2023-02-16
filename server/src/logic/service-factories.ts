/**
 * This file is a substitute for an IoC container
 */

import { SyncRunRepository } from '../data/SyncRunRepository';
import { SyncRunService } from './SyncRunService';
import knexInit from 'knex';
import { TransactionManager } from '../data/TransactionManager';

import dotenv from 'dotenv';
import { TransferService } from './TransferService';
import { SyncTriggerService } from './SyncTriggerService';
import { StripeRepository } from '../data/StripeRepository';
import { UserAccountsRepository } from '../data/UserAccountsRepository';
import { CustomersDbRepository } from '../data/CustomersDbRepository';
dotenv.config();

const knex = knexInit({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 1,
    max: 7,
  },
});

export function createSyncRunService() {
  return new SyncRunService(
    new SyncRunRepository(),
    new TransactionManager(knex)
  );
}

export function createTransferService() {
  return new TransferService(
    new SyncRunRepository(),
    new TransactionManager(knex),
    new StripeRepository(),
    new UserAccountsRepository(),
    new CustomersDbRepository(),
    {
      stripeChunkService:
        Number.parseInt(process.env.STRIPE_CHUNK_SIZE, 10) ?? 10,
    }
  );
}

export function createTriggerService() {
  return new SyncTriggerService(
    createSyncRunService(),
    createTransferService()
  );
}
