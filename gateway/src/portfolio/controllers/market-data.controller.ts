import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MarketDataClientService } from '../services/market-data-client.service';
import { JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('market-data')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
    constructor(private readonly marketDataClientService: MarketDataClientService) {}

    @Get('price/:symbol')
    async getMarketData(@Param('symbol') symbol: string) {
        try {
            const data = await this.marketDataClientService.getMarketData(symbol);
            return data;
        } catch (error) {
            return { message: 'Error fetching market data', error: error.message };
        }
    }

    @Get('historical/:symbol')
    async getHistoricalData(@Param('symbol') symbol: string) {
        try {
            const historicalData = await this.marketDataClientService.getHistoricalData(symbol);
            return historicalData;
        } catch (error) {
            return { message: 'Error fetching historical data', error: error.message };
        }
    }

    @Get('volatility/:symbol')
    async getVolatilityData(@Param('symbol') symbol: string) {
        try {
            const volatilityData = await this.marketDataClientService.getVolatilityData(symbol);
            return volatilityData;
        } catch (error) {
            return { message: 'Error fetching volatility data', error: error.message };
        }
    }

    @Get('benchmarks/monthly-last-year')
    async getBenchmarksMonthlyLastYear() {
        try {
            const benchmarks = await this.marketDataClientService.getBenchmarksMonthlyLastYear();
            return benchmarks;
        } catch (error) {
            return { message: 'Error fetching benchmarks', error: error.message };
        }
    }

    @Get('spy-intraday-chart')
    async getSpyIntradayChart() {
        try {
            const spyIntradayChart = await this.marketDataClientService.getSpyIntradayChart();
            return spyIntradayChart;
        } catch (error) {
            return { message: 'Error fetching SPY intraday chart', error: error.message };
        }
    }

    @Get('top-movers')
    async getTopMovers() {
        try {
            const topMovers = await this.marketDataClientService.getTopMovers();
            return topMovers;
        } catch (error) {
            return { message: 'Error fetching top movers', error: error.message };
        }
    }

    @Get('economic-events')
    async getEconomicEvents() {
        try {
            const economicEvents = await this.marketDataClientService.getEconomicEvents();
            return economicEvents;
        } catch (error) {
            return { message: 'Error fetching economic events', error: error.message };
        }
    }

    @Get('sectors-performance')
    async getSectorsPerformance() {
        try {
            const sectorsPerformance = await this.marketDataClientService.getSectorsPerformance();
            return sectorsPerformance;
        } catch (error) {
            return { message: 'Error fetching sectors performance', error: error.message };
        }
    }
}
