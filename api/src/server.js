import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({
    port: config.PORT,
    basePath: config.API_BASE_PATH,
    arcaEnv: config.ARCA_ENV,
    service: config.ARCA_SERVICE,
  }, 'API WSCDC iniciada');
});
