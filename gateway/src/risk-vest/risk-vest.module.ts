import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RiskService } from './services/risk.service';
import { RiskController } from './controllers/risk.controller';
import { AlertController } from './controllers/alert.controller';
import { AlertService } from './services/alert.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RISK_VEST_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3004,
                },
            },
        ]),
    ],
    controllers: [RiskController,AlertController],
    providers: [RiskService,AlertService],
})
export class RiskVestModule {}
