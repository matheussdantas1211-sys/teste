/// <reference path="./types/express.d.ts" />
import { createApp } from './app';
import { env } from './config/env';
import { scheduleBillingEngine } from './services/cron.service';

const app = createApp();

app.listen(Number(env.API_PORT), () => {
  scheduleBillingEngine();
  console.log(`API running on http://localhost:${env.API_PORT}`);
});
