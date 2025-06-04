import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PortfolioController } from './controllers/portfolio.controller';
import { PortfolioService } from './services/portfolio.service';
import { JwtStrategy } from '@amenferjani/shared-lib';
import { AssetController } from './controllers/asset.controller';
import { AssetService } from './services/asset.service';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { MarketDataController } from './controllers/market-data.controller';
import { MarketDataClientService } from './services/market-data-client.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'PORTFOLIO_SERVICE',
                transport: Transport.TCP,
                options:{host :"127.0.0.1",port : 3002}
            },
        ]),
    ],
    controllers: [PortfolioController,AssetController,TransactionController,MarketDataController],
    providers: [PortfolioService,AssetService,TransactionService,JwtStrategy,MarketDataClientService]
})
export class PortfolioModule {}
