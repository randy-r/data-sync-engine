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
import { HubspotTransferService } from './HubspotTransferService';
import { HubspotRepository } from '../data/HubspotRepository';
import { AppConfig } from './service.types';
import { ContactsDbRepository } from '../data/ContactsDbRepository';
import { CleanUpService } from './CleanUpService';
import { Throttler } from './Throttler';
dotenv.config();

const knex = knexInit({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 1,
    max: 7,
  },
});

const tm = new TransactionManager(knex);

const appConfig: AppConfig = {
  stripeChunkSize: Number.parseInt(process.env.STRIPE_CHUNK_SIZE, 10) ?? 10,
  hubspotChunkSize: Number.parseInt(process.env.HUBSPOT_CHUNK_SIZE, 10) ?? 10,
};

export function createSyncRunService() {
  return new SyncRunService(new SyncRunRepository(), tm);
}

const hubspotThrottler = new Throttler();

export function createTransferService() {
  return new TransferService(
    new SyncRunRepository(),
    tm,
    new StripeRepository(),
    new UserAccountsRepository(),
    new CustomersDbRepository(),
    new HubspotTransferService(
      new HubspotRepository(),
      new ContactsDbRepository(),
      tm,
      hubspotThrottler,
      appConfig
    ),
    appConfig
  );
}

export function createTriggerService() {
  return new SyncTriggerService(
    createSyncRunService(),
    createTransferService()
  );
}

export function createCleanUpService() {
  return new CleanUpService(tm);
}
