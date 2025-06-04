import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class MarketDataClientService {
    constructor(
        @Inject('PORTFOLIO_SERVICE') private readonly client: ClientProxy,
    ) {}

    async getMarketData(symbol: string) {
        try{
            return this.client.send({ cmd: 'get_market_data' }, symbol);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getHistoricalData(symbol: string) {
        return this.client.send({ cmd: 'get_historical_data' }, symbol);
    }

    async getVolatilityData(symbol: string) {
        return this.client.send({ cmd: 'get_volatility_data' }, symbol);
    }

    async getMarketNews(symbol: string) {
        return this.client.send({ cmd: 'get_market_news' }, symbol);
    }

    async getBenchmarksMonthlyLastYear() {
        return this.client.send({ cmd: 'get_benchmarks_monthly_Last_year' }, {});
    }

    async getSpyIntradayChart() {
        return this.client.send({ cmd: 'get_spy_intraday_chart' }, {});
    }

    async getTopMovers() {
        return this.client.send({ cmd: 'get_top_movers' }, {});
    }

    async getEconomicEvents() {
        return this.client.send({ cmd: 'get_economic_events' }, {});
    }

    async getSectorsPerformance() {
        return this.client.send({ cmd: 'get_sectors_performance' }, {});
    }
}
