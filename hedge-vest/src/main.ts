import { NestFactory } from '@nestjs/core';
import { HedgeModule } from './hedge.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const hedgeService = await NestFactory.createMicroservice<MicroserviceOptions>(HedgeModule, {
      transport: Transport.TCP,
      options: {
        host:'127.0.0.1',
        port: 3005,
      },
  });
  await hedgeService.listen();
  console.log(`🚀 HEDGE-VEST-SERVICE READY ON 3005 🚀`);
}
bootstrap();
