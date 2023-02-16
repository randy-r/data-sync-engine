import { IStripeRepository } from './repository.types';
import Stripe from 'stripe';

export class StripeRepository implements IStripeRepository {
  async getCustomers(access_token: string): Promise<any> {
    const stripe = new Stripe(access_token, { apiVersion: '2022-11-15' });
    const customers = await stripe.customers.list();
    return customers;
  }
}
