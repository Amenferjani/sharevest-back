import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RelModule } from './rel.module';

async function bootstrap() {
  const relService = await NestFactory.createMicroservice<MicroserviceOptions>(RelModule, {
    transport: Transport.TCP,
    options: {
      port: 3007,
      host : "127.0.0.1"
    },
  });

  await relService.listen();
  console.log(`🚀 REL-VEST-SERVICE READY ON 3007 🚀`);
}
bootstrap();
