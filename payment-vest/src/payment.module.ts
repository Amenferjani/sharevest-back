import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './services/stripe.service';
import { StripeController } from './controllers/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from '@amenferjani/shared-lib';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5438,
            username: 'payment_user',
            password: 'payment_pass',
            database: 'payment_db',
            ssl: false,
            entities: [PaymentTransaction],
            autoLoadEntities: true,
            synchronize: true,
        }),

        TypeOrmModule.forFeature([PaymentTransaction]),
    ],
    controllers:[StripeController],
    providers: [StripeService],
})
export class PaymentModule {}
