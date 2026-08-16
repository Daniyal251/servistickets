import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS для frontend приложений
  app.enableCors({
    origin: process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Rate limiting для защиты от DDoS и перегрузки
  // Для 2000+ concurrent users: 100 запросов в минуту на пользователя
  app.use(
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  );
  
  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Ticket Service API')
    .setDescription('API для сервиса продажи билетов')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API запущен на порту ${port}`);
}
bootstrap();
