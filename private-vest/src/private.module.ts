import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DealController } from './controllers/deal.controller';
import { InvestorTrackingController } from './controllers/investor-tracking.controller';
import { DealService } from './services/deal.service';
import { InvestorTrackingService } from './services/investor-tracking.service';
import { InvestorTracking , Deal } from '@amenferjani/shared-lib';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5437,
            username: 'private_user',
            password: 'private_pass',
            database: 'private_db',
            ssl: false,
            entities: [Deal , InvestorTracking],
            autoLoadEntities: true,
            synchronize: true,
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
