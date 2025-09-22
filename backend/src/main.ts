import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import morgan from 'morgan';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*', methods: '*' }, // for development purposes only!
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('tiny'));
  }

  if (process.env.NODE_ENV === 'production') {
    // Enable security middleware
    app.use(helmet());
  }

  await app.listen(port, () => {
    Logger.log(
      `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
    );
  });

  process.on('unhandledRejection', async () => {
    Logger.log('Critical error detected, shutting down...');
    await app.close();
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    Logger.log('SIGTERM signal received. Shutting down...');
    await app.close();
  });

  process.on('SIGINT', async () => {
    Logger.log('SIGINT signal received. Shutting down gracefully...');

    await app.close();
    process.exit(1);
  });
}

bootstrap();
