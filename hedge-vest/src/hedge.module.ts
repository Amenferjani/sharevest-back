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
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5436,
            username: 'hedge_user',
            password: 'hedge_pass',
            database: 'hedge_db',
            ssl: false,
            entities: [HedgeFund,Investment,PerformanceMetric],
            autoLoadEntities: true,
            synchronize: true,
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
