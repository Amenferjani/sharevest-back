import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const paymentService = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, {
    transport: Transport.TCP,
    options: {
      port: 3008,
      host : "127.0.0.1"
    },
  });
  await paymentService.listen();
  console.log(`🚀 PAYMENT-SERVICE READY ON 3008 🚀`);
}
bootstrap();
