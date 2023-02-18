import {
  HubspotContact,
  HubspotDbContact,
  StripeCustomer,
  StripeDbCustomer,
} from '../data/domain.types';

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

export function mapHubspotResponseToDomainContact(
  c: HubspotContact,
  account_id: string,
  sync_run_id: number
): HubspotDbContact {
  return {
    id: c.id,
    first_name: c.properties.firstname,
    last_name: c.properties.lastname,
    email: c.properties.email,
    created_at: c.properties.createdate,
    account_id,
    sync_run_id,
  };
}
