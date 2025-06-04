import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import {
	fetchEconomicEvents, CalendarType, Country, Currency, Language, Importance, TimeZone,
} from 'investing-economic-calendar';

@Injectable()
export class AlphaVantageService {
    private readonly apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    private readonly baseUrl = 'https://www.alphavantage.co/query';

    private readonly fmpBaseUrl = 'https://financialmodelingprep.com/api/v3';
    private readonly fmpApiKey= process.env.FMP_API_KEY;

    private getFunctionForInterval(interval: string): string {
        switch (interval) {
            case '1min':
            case '5min':
            case '15min':
            case '60min':
                return 'TIME_SERIES_INTRADAY';
            case 'daily':
                return 'TIME_SERIES_DAILY';
            case 'weekly':
                return 'TIME_SERIES_WEEKLY';
            case 'monthly':
                return 'TIME_SERIES_MONTHLY';
            default:
                throw new BadRequestException(`Unsupported interval: ${interval}`);
        }
    }

    async getAssetPrice(symbol: string): Promise<number> {
        try {
            const response = await axios.get(this.baseUrl, {
            params: {
                function: "GLOBAL_QUOTE",
                symbol,
                apikey: this.apiKey,
            },
            });
            console.log("[AlphaVantage] Raw response:", response.data);

            const data = response.data?.["Global Quote"];
            if (!data || !data["05. price"]) {
            throw new Error("Invalid data structure");
            }

            const price = parseFloat(data["05. price"]);
            if (isNaN(price)) {
            throw new Error("Price is not a number");
            }

            return price;
        } catch (err) {
            // Log the full error before we throw
            console.error("[AlphaVantage] getAssetPrice error:", err.response?.data || err.message);
            throw err;  // re-throw so your caller sees the actual error too
        }
    }

    async getMarketNews(): Promise<Array<{
        title: string;
        summary: string;
        url: string;
        time_published: string;
    }>> {
        try {
            const endpoint = `${this.fmpBaseUrl}/stable/news/stock-latest`;
            const response = await axios.get(endpoint, {
                params: { apikey: this.fmpApiKey },
            });

            const newsItems = (response.data as any[]).map(item => ({
                title: item.title,
                summary: item.text,
                url: item.url,
                time_published: item.publishedDate,
            }));

            return newsItems;
        } catch (err) {
            throw new HttpException(
                'Failed to fetch market news',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getCompanyNameAndAssetType(symbol: string): Promise<{ companyName: string; assetType: string }> {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: 'OVERVIEW',
                    symbol,
                    apikey: this.apiKey,
                },
            });

            const data = response.data;

            return {
                companyName: data?.['Name'] || symbol || "Unknown",
                assetType: data?.['AssetType'] || "Other",
            };
        } catch (error) {
            console.error("Failed to fetch company name:", error);
            return {
                companyName: symbol || "Unknown",
                assetType: "Other",
            };
        }
    }


    async getHistoricalPrice(symbol: string, interval: string = 'daily'): Promise<number> {
        try {
            const functionName = this.getFunctionForInterval(interval);
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: functionName,
                    symbol,
                    interval: functionName === 'TIME_SERIES_INTRADAY' ? interval : undefined,
                    apikey: this.apiKey,
                },
            });

            const timeSeriesKey = 
                functionName === 'TIME_SERIES_INTRADAY' ? `Time Series (${interval})` :
                functionName === 'TIME_SERIES_DAILY' ? 'Time Series (Daily)' :
                functionName === 'TIME_SERIES_WEEKLY' ? 'Weekly Time Series' :
                'Monthly Time Series';

            const timeSeries = response.data[timeSeriesKey];
            if (!timeSeries) throw new BadRequestException('Invalid response from Alpha Vantage');

            const lastDate = Object.keys(timeSeries)[0];
            return parseFloat(timeSeries[lastDate]['4. close']);
        } catch (error) {
            throw new HttpException('Failed to fetch historical price data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMarketData(symbol: string)
        : Promise<{
        symbol: string;
        companyName: string;
        assetType: string;
        latestPrice: number;
        risk: "Low"|"Medium"|"High";
        expectedReturn: number;
    }>
    {
        console.log("from alpha vantage service",symbol)
        const latestPrice = await this.getAssetPrice(symbol)
        const { companyName, assetType } = await this.getCompanyNameAndAssetType(symbol)
        const historicalData = await this.getHistoricalPrice(symbol)
        const expectedReturn = this.calculateExpectedReturn(historicalData, latestPrice)
        const volatility = await this.getAssetVolatility(symbol)
        const risk = this.classifyRisk(volatility)

        return {
            symbol,
            companyName,
            assetType,
            latestPrice,
            risk,
            expectedReturn,
        }
    }


    protected classifyRisk(volatility: number): 'Low' | 'Medium' | 'High' {
        if (volatility < 0.01) return 'Low';
        if (volatility < 0.03) return 'Medium';
        return 'High';
    }

    protected calculateExpectedReturn(historicalData:number, latestPrice:number): number {
        return ((latestPrice - historicalData) / historicalData) * 100;
    }

    async getAssetVolatility(assetSymbol: string, interval: string = 'daily'): Promise<number> {
        try {
            const functionName = this.getFunctionForInterval(interval);
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: functionName,
                    symbol: assetSymbol,
                    interval: functionName === 'TIME_SERIES_INTRADAY' ? interval : undefined,
                    apikey: this.apiKey,
                },
            });

            const timeSeriesKey = 
                functionName === 'TIME_SERIES_INTRADAY' ? `Time Series (${interval})` :
                functionName === 'TIME_SERIES_DAILY' ? 'Time Series (Daily)' :
                functionName === 'TIME_SERIES_WEEKLY' ? 'Weekly Time Series' :
                            'Monthly Time Series';
            
            const timeSeries = response.data[timeSeriesKey];
            if (!timeSeries) throw new BadRequestException('Invalid data from Alpha Vantage');

            const prices = Object.values(timeSeries)
                .slice(0, 10)
                .map((entry: any) => parseFloat(entry['4. close']));
            const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
            return Math.sqrt(variance);
        } catch (error) {
            throw new BadRequestException('Error fetching asset volatility');
        }
    }


    async getHistoricalVolatility(assetSymbol: string, interval: string = 'daily'): Promise<number[]> {
        try {
            const functionName = this.getFunctionForInterval(interval);
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: functionName,
                    symbol: assetSymbol,
                    interval: functionName === 'TIME_SERIES_INTRADAY' ? interval : undefined,
                    apikey: this.apiKey,
                },
            });

            const timeSeriesKey = 
                functionName === 'TIME_SERIES_INTRADAY' ? `Time Series (${interval})` :
                functionName === 'TIME_SERIES_DAILY' ? 'Time Series (Daily)' :
                functionName === 'TIME_SERIES_WEEKLY' ? 'Weekly Time Series' :
                'Monthly Time Series';

            const timeSeries = response.data[timeSeriesKey];
            if (!timeSeries) throw new BadRequestException('Invalid data from Alpha Vantage');

            const prices = Object.values(timeSeries).map((entry: any) => parseFloat(entry['4. close']));
            const priceChanges = prices.slice(1).map((price, index) => price - prices[index]);

            return priceChanges.map((_, index) => {
                const changes = priceChanges.slice(0, index + 1);
                const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
                const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
                return Math.sqrt(variance);
            });
        } catch (error) {
            throw new BadRequestException('Error fetching historical volatility');
        }
    }

    private async fetchMonthlySeries(
        symbol: string,
        months = 12,
        ): Promise<{ date: string; close: number }[]> {
        const functionName = this.getFunctionForInterval('monthly');
        try {
            const response = await axios.get(this.baseUrl, {
            params: {
                function: functionName,
                symbol,
                apikey: this.apiKey,
            },
            });

            const raw = response.data;
            console.log(`[AV][${symbol}] raw response:`, raw);

            // 1) Rate-limit hit?
            if (raw.Note) {
            throw new HttpException(
                'Alpha Vantage rate limit hit, try again later',
                HttpStatus.TOO_MANY_REQUESTS,
            );
            }
            // 2) Invalid symbol or other error?
            if (raw['Error Message']) {
            throw new BadRequestException(raw['Error Message']);
            }
            // 3) Pick whichever series key is present
            const seriesData =
            raw['Monthly Time Series'] ?? raw['Monthly Adjusted Time Series'];

            if (!seriesData) {
            console.error(
                `[AV][${symbol}] no monthly series key found in response.`,
                Object.keys(raw),
            );
            throw new BadRequestException(
                `No monthly data returned for ${symbol}`,
            );
            }

            // Parse into [{date, close}, …]
            const fullSeries = Object.entries(seriesData).map(
            ([date, vals]: [string, any]) => ({
                date,
                close: parseFloat(vals['4. close']),
            }),
            );

            // Sort oldest → newest and slice last `months`:
            fullSeries.sort((a, b) => a.date.localeCompare(b.date));
            return fullSeries.slice(-months);
        } catch (err) {
            console.error(
            `[AlphaVantage] fetchMonthlySeries(${symbol}) error:`,
            err.response?.data || err.message,
            );
            throw new HttpException(
            `Failed to fetch monthly series for ${symbol}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    /*
     ! Fetches the last 12 months of monthly closes
     ! for SPY, QQQ, and DIA (your S&P 500, NASDAQ-100 & Dow benchmarks).
     */
    async getBenchmarksMonthlyLastYear(): Promise<
        { symbol: string; history: { date: string; close: number }[] }[]
    > {
        const symbols = ['SPY', 'QQQ', 'DIA'];
        try {
        return await Promise.all(
            symbols.map(async (sym) => ({
            symbol: sym,
            history: await this.fetchMonthlySeries(sym, 12),
            })),
        );
        } catch (err) {
        console.error('[AlphaVantage] getBenchmarksMonthlyLastYear error:', err);
        throw new HttpException(
            'Failed to fetch benchmark monthly data',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    async fetchIntradaySeries(
        symbol: string,
        interval: string = '60min',
    ): Promise<{ timestamp: string; close: number }[]> {
        const functionName = this.getFunctionForInterval(interval);
        try {
        const response = await axios.get(this.baseUrl, {
            params: {
            function: functionName,
            symbol,
            interval: functionName === 'TIME_SERIES_INTRADAY' ? interval : undefined,
            apikey: this.apiKey,
            },
        });

        const raw = response.data;
        if (raw.Note) {
            throw new HttpException(
            'Alpha Vantage rate limit hit, try again later',
            HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        if (raw['Error Message']) {
            throw new BadRequestException(raw['Error Message']);
        }

        const key =
            functionName === 'TIME_SERIES_INTRADAY'
            ? `Time Series (${interval})`
            : functionName === 'TIME_SERIES_DAILY'
            ? 'Time Series (Daily)'
            : functionName === 'TIME_SERIES_WEEKLY'
            ? 'Weekly Time Series'
            : 'Monthly Time Series';

        const seriesData = raw[key];
        if (!seriesData) {
            throw new BadRequestException(`No intraday data returned for ${symbol}`);
        }

        const series = Object.entries(seriesData).map(
            ([ts, vals]: [string, any]) => ({
            timestamp: ts,
            close: parseFloat(vals['4. close']),
            }),
        );
        series.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        return series;
        } catch (err) {
        console.error(`[AlphaVantage] fetchIntradaySeries(${symbol}) error:`, err.response?.data || err.message);
        throw new HttpException(
            `Failed to fetch intraday series for ${symbol}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    async getTopMovers() {
        const response = await axios.get(this.baseUrl, {
            params: {
                function: 'TOP_GAINERS_LOSERS',
                apikey: this.apiKey,
            },
        })
        const data = response.data;
        if (data.Note) {
            throw new HttpException(
                'Alpha Vantage rate limit hit, try again later',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        if (data['Error Message']) {
            throw new BadRequestException(data['Error Message']);
        }
        const {
            top_gainers   = [],
            top_losers    = [],
            most_actively_traded = [],
            } = data

        return {
            topGainers: top_gainers,
            topLosers: top_losers,
            mostActivelyTraded: most_actively_traded,
        };
    }

    async getSectorsPerformance(): Promise<{ name: string; change: number }[]> {
        try {
        const response = await axios.get(
            `${this.fmpBaseUrl}/sectors-performance`,
            { params: { apikey: this.fmpApiKey } }
        );

        const data: Array<{ sector: string; changesPercentage: string }> =
            response.data;

        return data.map(item => ({
            name: item.sector,
            change: parseFloat(item.changesPercentage.replace('%', '')),
        }));
        } catch (error) {
        throw new HttpException(
            'Failed to fetch sector performance from FMP',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        }
    }

    async getEconomicEvents() {
        const eventsWeekly = await fetchEconomicEvents({
            importance: [Importance.HIGH,Importance.MEDIUM],
            calType:    CalendarType.WEEKLY,
            lang:       Language.ENGLISH,
            timeZone:   TimeZone.UTC,
            countries:  [
                Country.AUSTRALIA, Country.CANADA, Country.EURO_ZONE, Country.FRANCE,
                Country.GERMANY, Country.JAPAN, Country.NEW_ZEALAND, Country.SWITZERLAND,
                Country.UNITED_KINGDOM, Country.UNITED_STATES, Country.AUSTRIA,
                Country.BELGIUM, Country.IRELAND, Country.ITALY, Country.NETHERLANDS,
                Country.PORTUGAL, Country.SOUTH_AFRICA, Country.SPAIN,],
            });
        return eventsWeekly;
    }
}
