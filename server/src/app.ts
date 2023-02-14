import express, { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
import { createSyncService } from './logic/service-factories';
dotenv.config();

const app = express();
const port = 3007;

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
    const syncService = createSyncService();
    const syncResult = await syncService.performSynchronization();
    res.json(syncResult);
  }, next);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

app.use((err: { message: string }, req, res: Response, next) => {
  // TODO map logic layer errors to http codes
  res.status(500);
  console.error(err);
  res.send({
    message: 'Unexpected server error.',
  });
});
