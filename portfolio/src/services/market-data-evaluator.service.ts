import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import Redis from 'ioredis';
import { AlphaVantageService } from './alpha-vantage.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketDataService } from './market.data.service';

const assets: string[] = JSON.parse(fs.readFileSync('src/config/assets.dev.json', 'utf-8'));

/*
todo : change to assets.prod.json file in prod
todo : change ttl in all cache to what the data actually needs
*/
@Injectable()
export class MarketDataEvaluator implements OnModuleInit {
    private redisClient = new Redis('redis://127.0.0.1:6380');

    constructor(
        private readonly alphaVantageService: AlphaVantageService,
        private readonly marketDataService: MarketDataService,
    ) { }

    async onModuleInit() {
        console.log('Checking cache at startup...');
        // await this.redisClient.set(`test:1`, "test data", 'EX', 30 * 24 * 60 * 60);

        // for (const symbol of assets) {
        //     const exists = await this.redisClient.exists(`market:historical:${symbol}`);
        //     if (!exists) {
        //         console.log(`No cached data for ${symbol}, caching now...`);
        //         await this.cacheMarketData(symbol);
        //     }
        //     console.log(`Data for ${symbol} already cached, skipping...`);
        // }

        // const benchmarksExists = await this.redisClient.exists(`market:benchmarks:monthly:lastyear`);
        // if (!benchmarksExists) {
        //     console.log(`No cached benchmarks monthly last year data, caching now...`);
        //     await this.cacheBenchmarksMonthlyLastYear();
        // }

        const economicCalendarExists = await this.redisClient.exists(`market:economic:calendar`);
        if (!economicCalendarExists) {
            console.log(`No cached economic calendar data, caching now...`);
            await this.cacheEconomicCalendar();
        }

        const sectorsPerformanceExists = await this.redisClient.exists(`market:sectors:performance`);
        if (!sectorsPerformanceExists) {
            console.log(`No cached sectors performance data, caching now...`);
            await this.cacheSectorsPerformance();
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async updateMarketDataCache(): Promise<void> {
        console.log('Running scheduled cache update...');
        for (const symbol of assets) {
            await this.cacheMarketData(symbol);
        }
    }

    @Cron("0 2 1 * *")
    async updateBenchmarksMonthlyLastYear(): Promise<void> {
        console.log('Running scheduled benchmarks monthly last year data update...');
        await this.cacheBenchmarksMonthlyLastYear();
    }

    @Cron(CronExpression.EVERY_DAY_AT_5AM)
    async updateEconomicCalendar(): Promise<void> {
        console.log('Running scheduled economic calendar data update...');
        await this.cacheEconomicCalendar();
    }

    protected async cacheMarketData(symbol: string): Promise<void> {
        console.log(`Fetching and caching market data for ${symbol}…`)
        try {
            // 1) core “market data” call (price + overview + risk + return)
            const marketData = await this.alphaVantageService.getMarketData(symbol)
            await this.sleep(12_000); 
            // 2) historical price (if you really need it)
            const historicalPrice = await this.alphaVantageService.getHistoricalPrice(symbol)
            await this.sleep(12_000);
            // 3) volatility
            const volatility = await this.alphaVantageService.getAssetVolatility(symbol)
            await this.sleep(12_000);
            // 4) news
            // const marketNews = await this.alphaVantageService.getMarketNews(symbol)
            await this.sleep(12_000);
            // 5) historical volatility
            const historicalVol = await this.alphaVantageService.getHistoricalVolatility(symbol)
            await this.sleep(12_000);

            const ttl = 30 * 24 * 60 * 60
            await this.redisClient.set(`market:data:${symbol}`, JSON.stringify(marketData), "EX", ttl)
            await this.redisClient.set(`market:historical:${symbol}`, JSON.stringify(historicalPrice), "EX", ttl)
            await this.redisClient.set(`market:volatility:${symbol}`, JSON.stringify(volatility), "EX", ttl)
            // await this.redisClient.set(`market:news:${symbol}`, JSON.stringify(marketNews), "EX", ttl)
            await this.redisClient.set(`market:historicalVolatility:${symbol}`, JSON.stringify(historicalVol), "EX", ttl)

            console.log(`✅ Cached data for ${symbol}`)
        } catch (e) {
            console.error(`❌ Failed caching ${symbol}: ${e.message}`)
        }
    }

    protected sleep = (ms: number) =>{
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    protected async cacheBenchmarksMonthlyLastYear(): Promise<void> {
        console.log(`Fetching and caching benchmarks monthly last year data…`)
        try {
            const benchmarksMonthlyLastYear = await this.alphaVantageService.getBenchmarksMonthlyLastYear()
            const ttl = 35 * 24 * 60 * 60 // 35 days in seconds 
            await this.redisClient.set(`market:benchmarks:monthly:lastyear`, JSON.stringify(benchmarksMonthlyLastYear), "EX", ttl)
            console.log(`✅ Cached benchmarks monthly last year data`)
        } catch (e) {
            console.error(`❌ Failed caching benchmarks monthly last year data: ${e.message}`)
        }
    }

    protected async cacheEconomicCalendar(): Promise<void> {
        console.log(`Fetching and caching economic calendar data…`)
        try {
            const economicCalendar = await this.alphaVantageService.getEconomicEvents()
            const ttl = 35 * 24 * 60 * 60 // 30 days in seconds 
            await this.redisClient.set(`market:economic:calendar`, JSON.stringify(economicCalendar), "EX", ttl)
            console.log(`✅ Cached economic calendar data:`, JSON.stringify(economicCalendar, null, 2))
        } catch (e) {
            console.error(`❌ Failed caching economic calendar data: ${e.message}`)
        }
    }

    protected async cacheSectorsPerformance(): Promise<void> {
        console.log(`Fetching and caching sectors performance data…`)
        try {
            const sectorsPerformance = await this.alphaVantageService.getSectorsPerformance()
            const ttl = 35 * 24 * 60 * 60 // 30 days in seconds 
            await this.redisClient.set(`market:sectors:performance`, JSON.stringify(sectorsPerformance), "EX", ttl)
            console.log(`✅ Cached sectors performance data:`, JSON.stringify(sectorsPerformance, null, 2))
        } catch (e) {
            console.error(`❌ Failed caching sectors performance data: ${e.message}`)
        }
    }
}
