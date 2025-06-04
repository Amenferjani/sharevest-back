import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MarketDataService } from 'src/services/market.data.service';

@Controller()
export class MarketDataController {
    constructor(private readonly marketDataService: MarketDataService) {}

    @MessagePattern({cmd:'get_market_data'}) 
    async getMarketData(@Payload() symbol: string) {
            const marketData = await this.marketDataService.getMarketData(symbol);
            return marketData ;
    }

    @MessagePattern({cmd:'get_historical_data'})
    async getHistoricalData(@Payload() symbol: string) {
        try {
            const historicalData = await this.marketDataService.getHistoricalData(symbol);
            return historicalData;
        } catch (error) {
            return { message: 'Error fetching historical data', error: error.message };
        }
    }

    @MessagePattern({cmd:'get_volatility_data'}) 
    async getVolatilityData(@Payload() symbol: string) {
        try {
            const volatilityData = await this.marketDataService.getVolatilityData(symbol);
            return volatilityData;
        } catch (error) {
            return { message: 'Error fetching volatility data', error: error.message };
        }
    }

    @MessagePattern({cmd:'get_market_news'}) 
    async getMarketNews() {
        try {
        const marketNews = await this.marketDataService.getMarketNews();
        return marketNews;
        } catch (error) {
        return { message: 'Error fetching market news', error: error.message };
        }
    }

    @MessagePattern({ cmd: 'get_benchmarks_monthly_Last_year' })
    async getBenchmarksMonthlyLastYear() {
        try {
            const benchmarks = await this.marketDataService.getBenchmarksMonthlyLastYear();
            return benchmarks;
        } catch (error) {
            return { message: 'Error fetching benchmarks', error: error.message };
        }
    }

    @MessagePattern({ cmd: 'get_spy_intraday_chart' })
    async getSpyIntradayChart() {
        try {
            const spyIntradayChart = await this.marketDataService.getSpyIntradayChart();
            return spyIntradayChart;
        } catch (error) {
            return { message: 'Error fetching SPY intraday chart', error: error.message };
        }
    }

    @MessagePattern({ cmd: 'get_top_movers' })
    async getTopMovers() {
        try {
            const topMovers = await this.marketDataService.getTopMovers();
            return topMovers;
        } catch (error) {
            return { message: 'Error fetching top movers', error: error.message };
        }
    }

    @MessagePattern({ cmd: 'get_economic_events' })
    async getEconomicEvents() {
        try {
            const economicEvents = await this.marketDataService.getEconomicEvents();
            return economicEvents;
        } catch (error) {
            return { message: 'Error fetching economic events', error: error.message };
        }
    }

    @MessagePattern({ cmd: 'get_sectors_performance' })
    async getSectorsPerformance() {
        try {
            const sectorsPerformance = await this.marketDataService.getSectorsPerformance();
            return sectorsPerformance;
        } catch (error) {
            return { message: 'Error fetching sectors performance', error: error.message };
        }
    }
}
