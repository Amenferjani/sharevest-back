import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskProfileService } from './services/risk.service';
import { MarketAlert, RiskProfile, RiskProfileSchema ,MarketAlertSchema} from '@amenferjani/shared-lib';
import { RiskController } from './controllers/risk.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MarketAlertController } from './controllers/market-alert.controller';
import { MarketAlertService } from './services/market-alert.service';
import { AlertEvaluator } from './services/alert-evaluator.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'GATEWAY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3000, 
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001, 
        },
      },
      {
        name: 'PORTFOLIO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002, 
        },
      },
      {
        name: 'PART_VEST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3003, 
        },
      },
    ]),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGODB_RISK_URI'),
            }),
            inject: [ConfigService],
        }),
        
    MongooseModule.forFeature([
      { name: RiskProfile.name, schema: RiskProfileSchema },
      { name: MarketAlert.name, schema: MarketAlertSchema },
    ]), 
  ],
  controllers: [
    RiskController,
    MarketAlertController
  ],
  providers: [
    RiskProfileService,
    MarketAlertService,
    AlertEvaluator
  ],
})
export class RiskModule {}