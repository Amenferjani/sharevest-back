import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PrivateModule } from './private.module';

async function bootstrap() {
  const privateService = await NestFactory.createMicroservice<MicroserviceOptions>(PrivateModule, {
    transport: Transport.TCP,
    options: {
      host:'0.0.0.0',
      port: 3006,
    },
  });
  await privateService.listen();
  console.log(`🚀 PRIVATE-VEST-SERVICE READY ON 3006 🚀`);
}
bootstrap();
