import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host:'127.0.0.1',
      port: 3030,
    },
  });
  app.enableCors({
    origin: ['http://localhost:8080','https://6c5d-197-28-109-91.ngrok-free.app'],
    credentials: true, 
  });
  app.use(cookieParser());

  app.use('/payment/stripe/webhook', express.raw({ type: 'application/json' }));
  dotenv.config();
  if (process.env.NODE_ENV === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API documentation for your project')
      .setVersion('1.0')
      .addTag('API')
      .build();
  
    try {
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document);
    } catch (error) {
      console.error('Error setting up Swagger:', error);
    }
  }
  await microservice.listen();
  await app.listen(3000);
  console.log(`🚀 HTTP ON 3000 TCP ON 3030  🚀`);
}
bootstrap();
