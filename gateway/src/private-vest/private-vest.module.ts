import { Module } from '@nestjs/common';
import { ClientsModule , Transport} from '@nestjs/microservices';
import { DealController } from './controllers/deal.controller';
import { DealService } from './services/deal.service';
import { InvestorTrackingController } from './controllers/investor-tracking.controller';
import { InvestorTrackingService } from './services/investor-tracking.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'PRIVATE_VEST_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: "private-vest-service",
                    port: 3006
                }
            },
        ]),
    ],
    controllers: [DealController,InvestorTrackingController],
    providers:[DealService,InvestorTrackingService]
})
export class PrivateVestModule {}
