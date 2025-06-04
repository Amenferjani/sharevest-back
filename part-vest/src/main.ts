import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CrowdfundingModule } from './crowdfunding.module';


async function bootstrap() {
  const crowdfundingService = await NestFactory.createMicroservice<MicroserviceOptions>(CrowdfundingModule, {
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 3003 },
  });
  await crowdfundingService.listen();
  console.log(`🚀 PART-VEST-SERVICE READY ON 3003 🚀`);
}
bootstrap();
