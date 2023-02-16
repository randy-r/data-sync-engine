import { SyncRunRepository } from '../data/SyncRunRepository';
import { SyncRunService } from './SyncRunService';
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

export function createSyncRunService() {
  return new SyncRunService(new SyncRunRepository(), new TransactionManager(knex));
}
