import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ClientsModule ,Transport} from '@nestjs/microservices';
import { StripeController } from './controllers/stripe.controller';
import { StripeService } from './services/stripe.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'PAYMENT_SERVICE',
                transport: Transport.TCP,
                options: { host: "127.0.0.1", port: 3008 }
            },
        ]),
    ],
    controllers: [StripeController],
    providers: [StripeService],
})
export class PaymentModule {}
