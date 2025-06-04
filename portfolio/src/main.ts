import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PortfolioModule } from './portfolio.module';

async function bootstrap() {
  const portfolioService = await NestFactory.createMicroservice<MicroserviceOptions>(PortfolioModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3002,
    },
  });

  await portfolioService.listen();
  console.log(`🚀 PORTFOLIO-SERVICE READY ON 3002 🚀`);

}
bootstrap();
