import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';


async function bootstrap() {
  const userService = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3001,
    },
  });

  await userService.listen();
  console.log(`🚀 USER-SERVICE READY ON 3001 🚀`);
}
bootstrap();
