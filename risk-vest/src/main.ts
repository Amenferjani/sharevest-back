import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RiskModule } from './risk.module';


async function bootstrap() {
  const riskService = await NestFactory.createMicroservice<MicroserviceOptions>(RiskModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3004,
    },
  });
  await riskService.listen();
  console.log(`🚀 RISK-SERVICE READY ON 3004 🚀`);
}
bootstrap();
