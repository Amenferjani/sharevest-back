import { Module } from '@nestjs/common';
import { CrowdfundingService } from './services/crowdfunding.service';
import { CrowdfundingController } from './controllers/crowdfunding.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from '@amenferjani/shared-lib';
import { Contribution, ContributionSchema } from '@amenferjani/shared-lib';
import { Update, UpdateSchema } from '@amenferjani/shared-lib';
import { CampaignService } from './services/campaign.service';
import { ContributionService } from './services/contribution.service';
import { UpdateService } from './services/update.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CampaignController } from './controllers/campaign.controller';
import { ContributionController } from './controllers/contribution.controller';
import { UpdateController } from './controllers/update.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options:{host :"127.0.0.1",port : 3001}
            },
        ]),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGODB_CROWDFUNDING_URI'),
            }),
            inject: [ConfigService],
        }),
        

        MongooseModule.forFeature([
            { name: Campaign.name, schema: CampaignSchema },
            { name: Contribution.name, schema: ContributionSchema },
            { name: Update.name, schema: UpdateSchema },
        ]),
    ],
    controllers: [
        CrowdfundingController,
        CampaignController,
        ContributionController,
        UpdateController,
    ],
    providers: [
        CrowdfundingService,
        CampaignService,
        ContributionService,
        UpdateService,
    ],
})
export class CrowdfundingModule {}
