import { Module } from '@nestjs/common';
import { HedgeFundController } from './controllers/hedge-fund.controller';
import { HedgeFundService } from './services/hedge-fund.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InvestmentController } from './controllers/investment.controller';
import { InvestmentService } from './services/investment.service';
import { PerformanceMetricController } from './controllers/performance-metric.controller';
import { PerformanceMetricService } from './services/performance-metric.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'HEDGE_VEST_SERVICE',
                transport: Transport.TCP,
                options:{host :"hedge-vest-service",port : 3005}
            },
        ]),
    ],
    controllers: [HedgeFundController,InvestmentController,PerformanceMetricController],
    providers: [HedgeFundService,InvestmentService,PerformanceMetricService],
})
export class HedgeFundModule {}
