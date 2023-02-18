import {
  GetHubspotContactsResponse,
  IHubspotRepository,
} from './repository.types';
import fetch from 'cross-fetch';

export class HubspotRepository implements IHubspotRepository {
  async getContacts(
    access_token: string,
    params?: { limit?: number; starting_after?: string }
  ): Promise<GetHubspotContactsResponse> {
    const afterQs = params.starting_after
      ? `&after=${params.starting_after}`
      : '';
    const fetchResponse = await fetch(
      `https://api.hubapi.com/crm/v4/objects/contacts?limit=${params.limit}${afterQs}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (fetchResponse.ok) {
      const parsedResponse = (await fetchResponse.json()) as Omit<
        GetHubspotContactsResponse,
        'rateLimit'
      >;

      const headers = fetchResponse.headers;

      return {
        ...parsedResponse,
        rateLimit: {
          max: Number.parseInt(headers.get('x-hubspot-ratelimit-max'), 10),
          remaining: Number.parseInt(
            headers.get('x-hubspot-ratelimit-remaining')
          ),
          intervalMs: Number.parseInt(
            headers.get('x-hubspot-ratelimit-interval-milliseconds'),
            10
          ),
        },
      };
    } else {
      // TODO specialized errors
      const body = await fetchResponse.json();
      console.error(body);
      throw new Error(
        `Hubspot response was unsuccessful, https status code: ${fetchResponse.status}.`
      );
    }
  }
}
