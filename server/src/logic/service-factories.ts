import { SyncRunRepository } from '../data/SyncRunRepository';
import { SyncService } from './SyncService';
import knexInit from 'knex';
import { TransactionManager } from '../data/TransactionManager';

import dotenv from 'dotenv';
dotenv.config();

const knex = knexInit({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 1,
    max: 7,
  },
});

export function createSyncService() {
  return new SyncService(new SyncRunRepository(), new TransactionManager(knex));
}
