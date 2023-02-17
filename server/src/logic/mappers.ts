import { StripeCustomer, StripeDbCustomer } from '../data/domain.types';

export function mapStripeResponseToDomainCustomer(
  c: StripeCustomer,
  account_id: string,
  sync_run_id: number
): StripeDbCustomer {
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
