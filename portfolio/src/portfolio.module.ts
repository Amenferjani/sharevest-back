import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortfolioService } from './services/portfolio.service';
import { AssetService } from './services/asset.service';
import { TransactionService } from './services/transaction.service';
import { AlphaVantageService } from './services/alpha-vantage.service';
// import { AlphaVantageController } from './controllers/alpha-vantage.controller';
import { Portfolio } from '@amenferjani/shared-lib';
import { Asset } from '@amenferjani/shared-lib';
import { Transaction } from '@amenferjani/shared-lib';
import { PortfolioController } from './controllers/portfolio.controller';
import { AssetController } from './controllers/asset.controller';
import { TransactionController } from './controllers/transaction.controller';
import { MarketDataEvaluator } from './services/market-data-evaluator.service';
import { MarketDataController } from './controllers/market-data.controller';
import { MarketDataService } from './services/market.data.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5434,
            username: 'portfolio_user',
            password: 'portfolio_pass',
            database: 'portfolio_db',
            ssl: false,
            entities: [Portfolio, Asset, Transaction],
            autoLoadEntities: true,
            synchronize: true,
        }),

        TypeOrmModule.forFeature([Portfolio, Asset, Transaction]),
    ],
    controllers: [
        PortfolioController,
        AssetController,
        TransactionController,
        // AlphaVantageController,
        MarketDataController,
    ],
    providers: [
        PortfolioService,
        AssetService,
        TransactionService,
        AlphaVantageService,
        MarketDataEvaluator,
        MarketDataService,
    ],
})
export class PortfolioModule {}
