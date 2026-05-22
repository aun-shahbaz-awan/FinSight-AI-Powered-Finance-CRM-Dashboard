import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getPort() {
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }

  if (process.env.API_URL) {
    return Number(new URL(process.env.API_URL).port);
  }

  return 4000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(getPort());
}
bootstrap();
