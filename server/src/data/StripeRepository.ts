import { IStripeRepository } from './repository.types';
import Stripe from 'stripe';
import { StripeCustomer } from './domain.types';

export class StripeRepository implements IStripeRepository {
  async getCustomers(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<{ data: StripeCustomer[]; has_more: boolean }> {
    const stripe = new Stripe(access_token, { apiVersion: '2022-11-15' });
    const customers = await stripe.customers.list(params);
    return customers;
  }
}
