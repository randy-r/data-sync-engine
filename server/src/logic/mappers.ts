import Stripe from 'stripe';
import { StripeCustomer } from '../data/domain.types';

export function mapStripeResponseToDomainCustomer(
  c: Stripe.Customer,
  account_id: string,
  sync_run_id: number
): StripeCustomer {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    email: c.email,
    created_at: new Date(c.created * 1000).toISOString(),
    account_id,
    sync_run_id,
  };
}
