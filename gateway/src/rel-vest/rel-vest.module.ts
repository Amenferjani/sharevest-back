import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { JwtStrategy } from '@amenferjani/shared-lib';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { InvestorController } from './controllers/investor.controller';
import { InvestorService } from './services/investor.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'REL_VEST_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: 3007,
                },
            },
        ]),
    ],
    controllers: [CompanyController,EventController,InvestorController],
    providers: [CompanyService, EventService, InvestorService,JwtStrategy],
})
export class RelVestModule {}
