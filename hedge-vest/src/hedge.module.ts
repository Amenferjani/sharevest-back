import { Module } from '@nestjs/common';
import { HedgeFundService } from './services/hedge-fund.service';
import { InvestmentService } from './services/investment.service';
import { PerformanceMetricService } from './services/performance-metric.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HedgeFund } from '@amenferjani/shared-lib';
import { Investment } from '@amenferjani/shared-lib';
import { PerformanceMetric } from '@amenferjani/shared-lib';
import { HedgeFundController } from './controllers/hedge-fund.controller';
import { InvestmentController } from './controllers/investment.controller';
import { PerformanceMetricController } from './controllers/performance-metric.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('HEDGE_TYPEORM_HOST'),
                port: configService.get<number>('HEDGE_TYPEORM_PORT'),
                username: configService.get('HEDGE_TYPEORM_USERNAME'),
                password: configService.get('HEDGE_TYPEORM_PASSWORD'),
                database: configService.get('HEDGE_TYPEORM_DATABASE'),
                synchronize: configService.get('HEDGE_TYPEORM_SYNCHRONIZE') === 'true',
                ssl: configService.get('HEDGE_TYPEORM_SSL') === 'true',
                entities:[HedgeFund,Investment,PerformanceMetric]
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([HedgeFund,Investment,PerformanceMetric])
    ],
    controllers: [
        HedgeFundController,
        InvestmentController,
        PerformanceMetricController
    ],
    providers: [
        HedgeFundService,
        InvestmentService,
        PerformanceMetricService
    ],
})
export class HedgeModule { }
