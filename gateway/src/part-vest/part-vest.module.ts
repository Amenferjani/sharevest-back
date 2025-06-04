import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CampaignService } from './services/campaign.service';
import { ContributionService } from './services/contribution.service';
import { UpdateService } from './services/update.service';
import { CampaignController } from './controllers/campaign.controller';
import { ContributionController } from './controllers/contribution.controller';
import { UpdateController } from './controllers/update.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'PART_VEST_SERVICE',
                transport: Transport.TCP,
                options:{host :"127.0.0.1",port : 3003}
            },
        ]),
    ],
    controllers:[CampaignController,ContributionController,UpdateController],
    providers:[CampaignService,ContributionService,UpdateService],
})
export class PartVestModule {}
