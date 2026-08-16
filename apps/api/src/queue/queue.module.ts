import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueProcessor } from './queue.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          maxRetriesPerRequest: null, // Для работы с NestJS
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    // Очередь для отправки email уведомлений
    BullModule.registerQueue({
      name: 'email',
    }),
    // Очередь для генерации QR-кодов
    BullModule.registerQueue({
      name: 'qr-generation',
    }),
    // Очередь для обработки платежей
    BullModule.registerQueue({
      name: 'payment',
    }),
    // Очередь для аналитики
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [QueueProcessor],
  exports: [BullModule],
})
export class QueueModule {}
