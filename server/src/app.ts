import express, { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
import {
  createCleanUpService,
  createTriggerService,
} from './logic/service-factories';
dotenv.config();

const app = express();
const port = 3007;

const cleanUpService = createCleanUpService();
const cleanUpPromise = cleanUpService.cleanUpHangingSyncRuns();

async function tryOrNext<R>(func: () => Promise<R>, next: NextFunction) {
  try {
    return await func();
  } catch (e) {
    console.error(e);
    next(e);
  }
}

app.post('/api/sync', async (req, res, next) => {
  await tryOrNext(async () => {
    // make sure clean was done at start time
    await cleanUpPromise;

    const s = createTriggerService();
    const syncRun = await s.triggerSync();
    res.json(syncRun);
  }, next);
});

app.listen(port, () => {
  return console.info(`Express is listening at http://localhost:${port}`);
});

app.use((err: { message: string }, req, res: Response, next) => {
  // TODO map logic layer errors to http codes
  res.status(500);
  console.error(err);
  res.send({
    message: 'Unexpected server error.',
  });
});
