import Redis from "ioredis";
import { AlphaVantageService } from "./alpha-vantage.service";
import { Injectable } from "@nestjs/common";

@Injectable() 
export class MarketDataService {
/*
todo : change ttl in all cache to what the data actually needs
*/
    private redisClient = new Redis('redis://127.0.0.1:6380');

    constructor(
        private readonly alphaVantageService: AlphaVantageService,
    ) {}

    async getMarketData(symbol: string): Promise<any> {
        console.log(symbol)
        const cachedData = await this.redisClient.get(`market:data:${symbol}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const assetDetails = await this.alphaVantageService.getMarketData(symbol);
        await this.redisClient.set(`market:data:${symbol}`, JSON.stringify(assetDetails), 'EX', 86400);
        console.log(`Market data for ${symbol} cached for 24 hours data : ${assetDetails}`);
        return assetDetails;
        
    }

    async getHistoricalData(symbol: string): Promise<any> {
        const cachedData = await this.redisClient.get(`market:historical:${symbol}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const historicalData = await this.alphaVantageService.getHistoricalPrice(symbol);
        await this.redisClient.set(`market:historical:${symbol}`, JSON.stringify(historicalData), 'EX', 86400);
        return historicalData;
    }

    async getVolatilityData(symbol: string): Promise<any> {
        const cachedData = await this.redisClient.get(`market:volatility:${symbol}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const volatilityData = await this.alphaVantageService.getAssetVolatility(symbol);
        await this.redisClient.set(`market:volatility:${symbol}`, JSON.stringify(volatilityData), 'EX', 86400);
        return volatilityData;
    }

    async getMarketNews(): Promise<any> {
        const cachedData = await this.redisClient.get(`market:news`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const marketNews = await this.alphaVantageService.getMarketNews();
        await this.redisClient.set(`market:news`, JSON.stringify(marketNews), 'EX', 86400);
        return marketNews;
    }
    async getBenchmarksMonthlyLastYear(): Promise<any> {
        const cachedData = await this.redisClient.get(`market:benchmarks:monthly:lastyear`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const benchmarksMonthlyLastYear = await this.alphaVantageService.getBenchmarksMonthlyLastYear();
        const ttl = 35 * 24 * 60 * 60; // ! 35 days in seconds
        await this.redisClient.set(`market:benchmarks:monthly:lastyear`, JSON.stringify(benchmarksMonthlyLastYear), 'EX', ttl);
        return benchmarksMonthlyLastYear;
    }

    async getSpyIntradayChart(
        interval: string = '60min',
        points: number = 50,
    ): Promise<
        { timestamp: string; close: number; ma20: number }[]
        > {
            const cachedData = await this.redisClient.get(`market:spy:intraday:${interval}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const rawSeries = await this.alphaVantageService.fetchIntradaySeries('SPY', interval);
            const slice = rawSeries.slice(-points);

            return slice.map((pt, i, arr) => {
            const window = arr.slice(Math.max(0, i - 19), i + 1);
            const sum = window.reduce((acc, w) => acc + w.close, 0);
            const ma20 = sum / window.length;
                const chartData = { ...pt, ma20 };
                const ttl = 35 * 24 * 60 * 60;
            this.redisClient.set(`market:spy:intraday`, JSON.stringify(chartData), 'EX', ttl);
            return chartData;
        });
    }

    async getTopMovers() {
        const cachedData = await this.redisClient.get(`market:movers`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const topMovers = await this.alphaVantageService.getTopMovers();
        const ttl = 35 * 24 * 60 * 60;
        await this.redisClient.set(`market:movers`, JSON.stringify(topMovers), 'EX', ttl);
        return topMovers;
    }

    async getEconomicEvents() {
        const cachedData = await this.redisClient.get(`market:economic:calendar`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const economicEvents = await this.alphaVantageService.getEconomicEvents();
        const ttl = 24 * 60 * 60;
        await this.redisClient.set(`market:economic:calendar`, JSON.stringify(economicEvents), 'EX', ttl);
        return economicEvents;
    }

    async getSectorsPerformance() {
        const cachedData = await this.redisClient.get(`market:sectors:performance`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const sectorsPerformance = await this.alphaVantageService.getSectorsPerformance();
        const ttl = 24 * 60 * 60;
        await this.redisClient.set(`market:sectors:performance`, JSON.stringify(sectorsPerformance), 'EX', ttl);
        return sectorsPerformance;
    }
}


