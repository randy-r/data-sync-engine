import { HubspotContact, StripeDbCustomer } from './domain.types';
import { IHubspotRepository } from './repository.types';
import * as hubspot from '@hubspot/api-client';
import {  ForwardPaging } from '@hubspot/api-client/lib/codegen/crm/objects/';

export class HubspotRepository implements IHubspotRepository {
  async getContacts(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<{ results: HubspotContact[]; paging?: ForwardPaging }> {
    const client = new hubspot.Client({ accessToken: access_token });
    const resp = await client.crm.contacts.basicApi.getPage(
      params.limit,
      params.starting_after
    );
    
    // TODO better TS, the actual objects fit but the hubspot properties field is of type Record<string,...>
    // @ts-ignore
    return resp;
  }
}
