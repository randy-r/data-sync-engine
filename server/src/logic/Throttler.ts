import Bottleneck from 'bottleneck';
import { HubspotRateLimit } from '../data/repository.types';
import { delay } from '../utils/misc';

export class Throttler {
  delayPromise: Promise<unknown> | null = null;
  limiter: Bottleneck;
  constructor() {
    this.limiter = new Bottleneck({
      maxConcurrent: 3,
    });
  }

  async throttleIfNeeded<R extends { rateLimit: HubspotRateLimit }>(
    func: () => Promise<R>
  ): Promise<R> {
    if (this.delayPromise) await this.delayPromise;
    const r = await this.limiter.schedule(() => func());
    if (r.rateLimit.remaining < 15) {
      console.info('waiting because of rate limit', r);
      this.delayPromise = delay(5_000);
    }
    return r;
  }
}
