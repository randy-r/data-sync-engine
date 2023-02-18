import { UserAccountValue } from './domain.types';
import dotenv from 'dotenv';
dotenv.config();

export const userAccounts = new Map<string, UserAccountValue>([
  [
    'Tom',
    { service: 'stripe', access_token: process.env.STRIPE_ACCESS_TOKEN! },
  ],
  [
    'Jane',
    { service: 'hubspot', access_token: process.env.HUBSPOT_ACCESS_TOKEN },
  ],
  [
    'Joe',
    { service: 'stripe', access_token: process.env.STRIPE_ACCESS_TOKEN! },
  ],
]);
