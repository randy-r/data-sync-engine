import { HubspotRateLimit } from '../data/repository.types';
import { delay } from '../utils/misc';

export class Throttler {
  delayPromise: Promise<unknown> | null = null;

  async throttleIfNeeded<R extends { rateLimit: HubspotRateLimit }>(
    func: () => Promise<R>
  ): Promise<R> {
    if (this.delayPromise) await this.delayPromise;
    const r = await func();
    if (r.rateLimit.remaining < 15) {
      this.delayPromise = delay(1_000);
    }
    return r;
  }
}
