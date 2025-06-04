import { Inject, Injectable } from '@nestjs/common';
import { Cron , CronExpression} from '@nestjs/schedule';
import { MarketAlertService } from './market-alert.service';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';

const assets = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'DIS', 'NFLX', 'JNJ', 'BAC', 'V', 'JPM', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'GC=F', 'CL=F', 'SI=F', 'NG=F', 'SPY', 'QQQ', 'ARKK', 'XLF', 'XLK', '^GSPC', '^IXIC', '^DJI', '^FTSE', '^N225', '^HSI' ];

@Injectable()
export class AlertEvaluator {
    constructor(
        @Inject('PORTFOLIO_SERVICE') private readonly portfolioServiceClient: ClientProxy,
        @Inject('GATEWAY_SERVICE') private readonly gatewayServiceClient: ClientProxy,
        @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
        private readonly marketAlertService: MarketAlertService,
    ) { }
    private redisClient = new Redis('redis://127.0.0.1:6380');
    @Cron(CronExpression.EVERY_DAY_AT_NOON) 
    protected async updateMarketDataCache() {
        console.log('Fetching latest market data...');

        for (const assetSymbol of assets) {
            const currentPrice = await this.portfolioServiceClient.send({ cmd: 'get_asset_price' }, { assetSymbol }).toPromise();
            const historicalPrice = await this.portfolioServiceClient.send({ cmd: 'get_historical_price' }, { assetSymbol }).toPromise();
            const volatility = await this.portfolioServiceClient.send({ cmd: 'get_asset_volatility' }, { symbol: assetSymbol }).toPromise();

            await this.redisClient.set(`market:price:${assetSymbol}`, currentPrice, 'EX', 3600);
            await this.redisClient.set(`market:historical:${assetSymbol}`, historicalPrice, 'EX', 3600);
            await this.redisClient.set(`market:volatility:${assetSymbol}`, volatility, 'EX', 3600);
        }

        console.log('Market data updated in cache.');
    }

    protected async evaluateActiveAlerts(alertFrequency: 'immediate' | 'daily' | 'weekly' = 'immediate') {
        const alerts = await this.marketAlertService.getAllActiveAlertsByFrequency(alertFrequency);
        for (const alert of alerts) {
            const conditionIsMet = await this.marketAlertService.handleAlert(alert);
            if (conditionIsMet) {
                await this.gatewayServiceClient.emit({cmd:"send_alert_notification"},alert).toPromise()
                const notificationChanel = alert.notificationChannel;
                if (notificationChanel === "email") {
                    //todo handel email sending:
                    await this.userServiceClient.emit({ cmd: "send_email_notification" }, {
                        to: alert.userId,
                        subject: 'Alert Triggered',
                        body: `Your alert for ${alert.assetSymbol} has been triggered.`
                    }).toPromise()
                }
                if (notificationChanel === "sms") {
                    //todo handle sms sending
                }
            }
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async evaluateImmediateAlerts() {
        await this.evaluateActiveAlerts('immediate');
    }

    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async evaluateDailyAlerts() {
        await this.evaluateActiveAlerts('daily');
    }

    @Cron(CronExpression.EVERY_WEEK)
    async evaluateWeeklyAlerts() {
        await this.evaluateActiveAlerts('weekly');
    }
}