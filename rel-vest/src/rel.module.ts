import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CompanyService } from './services/company.service';
import { InvestorService } from './services/investor.service';
import { EventService } from './services/event.service';
import { CompanyController } from './controllers/company.controller';
import { EventController } from './controllers/event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Investor, Event } from '@amenferjani/shared-lib';
import { InvestorController } from './controllers/investor.controller';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5435,
            username: 'rel_user',
            password: 'rel_pass',
            database: 'rel_db',
            ssl: false,
            entities: [Company, Investor, Event],
            autoLoadEntities: true,
            synchronize: true,
        }),

        TypeOrmModule.forFeature([Company, Investor, Event]),
    ],
    providers: [
        CompanyService,
        InvestorService,
        EventService,
    ],
    controllers: [
        CompanyController,
        EventController,
        InvestorController,
    ],
})
export class RelModule { }
