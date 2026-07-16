import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 ShopSphere API running at http://localhost:${env.PORT}`);
});
