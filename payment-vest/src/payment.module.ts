import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './services/stripe.service';
import { StripeController } from './controllers/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from '@amenferjani/shared-lib';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('TYPEORM_HOST'),
                port: configService.get('TYPEORM_PORT'),
                username: configService.get('TYPEORM_USERNAME'),
                password: configService.get('TYPEORM_PASSWORD'),
                database: configService.get('TYPEORM_DATABASE'),
                synchronize: configService.get('TYPEORM_SYNCHRONIZE') === 'true',
                ssl: configService.get('TYPEORM_SSL') === 'true'
                    ? { rejectUnauthorized: false }
                    : false,
                entities: [PaymentTransaction],
                autoLoadEntities: true, 
            }),
            inject: [ConfigService],
        }),

        TypeOrmModule.forFeature([PaymentTransaction]),
    ],
    controllers:[StripeController],
    providers: [StripeService],
})
export class PaymentModule {}
