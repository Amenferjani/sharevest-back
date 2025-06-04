import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DealController } from './controllers/deal.controller';
import { InvestorTrackingController } from './controllers/investor-tracking.controller';
import { DealService } from './services/deal.service';
import { InvestorTrackingService } from './services/investor-tracking.service';
import { InvestorTracking , Deal } from '@amenferjani/shared-lib';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('PRIVATE_TYPEORM_HOST'),
                port: configService.get('PRIVATE_TYPEORM_PORT'),
                username: configService.get('PRIVATE_TYPEORM_USERNAME'),
                password: configService.get('PRIVATE_TYPEORM_PASSWORD'),
                database: configService.get('PRIVATE_TYPEORM_DATABASE'),
                synchronize: configService.get('PRIVATE_TYPEORM_SYNCHRONIZE') === 'true',
                ssl: configService.get('PRIVATE_TYPEORM_SSL') === 'true'
                    ? { rejectUnauthorized: false }
                    : false,
                entities: [Deal , InvestorTracking],
                autoLoadEntities: true, 
            }),
            inject: [ConfigService],
        }),

        TypeOrmModule.forFeature([Deal , InvestorTracking]),
    ],
    controllers: [
        DealController,
        InvestorTrackingController
    ],
    providers:[DealService,InvestorTrackingService],
})
export class PrivateModule {}
/*
!!waiting

* *****WORK***** *:
?For Deals:
createDeal(dealDto)
updateDeal(id, dealDto)
deleteDeal(id)
getDealList(filters?)
getDealDetails(id)
?For Investors:
addInvestor(investorDto)
updateInvestor(id, investorDto)
removeInvestor(id)
getInvestmentsByInvestor(investorId)
getInvestorsByDeal(dealId)
?For Reporting:
generateDealReport(dealId)
getTopDeals(filters?)
trackDealLifecycle(dealId)
!!For Premium Features:
getExclusiveDeals(userId)
getPerformanceTracking(dealId)
scheduleStrategySession(userId, expertId)
*/