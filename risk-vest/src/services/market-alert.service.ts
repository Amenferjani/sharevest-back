import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AlertType, MarketAlert, ConditionType, RoleEnum } from '@amenferjani/shared-lib';
import { CreateAlertDto } from '@amenferjani/shared-lib'; 
import { RiskProfileService } from './risk.service';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';

@Injectable()
export class MarketAlertService {
        private redisClient = new Redis('redis://127.0.0.1:6380');
    constructor(
        @InjectModel(MarketAlert.name)
        private marketAlertModel: Model<MarketAlert>,
        private readonly riskProfileService: RiskProfileService,
        @Inject('PORTFOLIO_SERVICE') private readonly portfolioServiceClient: ClientProxy,
        @Inject('PART_VEST_SERVICE') private readonly partVestClient: ClientProxy,
    ) { }

    async createAlert(alertData: CreateAlertDto): Promise<MarketAlert> {
        let message: string;

        switch (alertData.alertType) {
            case AlertType.RiskThreshold:
                message = `Risk threshold exceeded! Current risk score is ${alertData.threshold}%`;
                break;
            case AlertType.MarketDrop:
                message = `Market drop detected! Price has dropped by ${alertData.threshold}%`;
                break;
            case AlertType.PriceIncrease:
                message = `Price of ${alertData.assetSymbol} increased above ${alertData.threshold}`;
                break;
            case AlertType.PriceDecrease:
                message = `Price of ${alertData.assetSymbol} dropped below ${alertData.threshold}`;
                break;
            case AlertType.VolatilitySpike:
                message = `Volatility spike detected for ${alertData.assetSymbol}`;
                break;
            case AlertType.FundingProgress:
                message = `Crowdfunding campaign ${alertData.campaignId} reached ${alertData.threshold}% funding`;
                break;
            default:
                message = 'No specific alert message set.';
                break;
        }

        const newAlert = new this.marketAlertModel({ ...alertData, message });
        if( newAlert.alertFrequency == 'immediate'){
            
        } 

        const savedAlert = await newAlert.save();

        // (Optional) Trigger the alert if not manual
        // Uncomment if additional trigger logic is required
        // if (!savedAlert.isManual) {
        //     await this.triggerAlert(savedAlert);
        // }

        return savedAlert;
    }

    async getUserAlerts(userId: string): Promise<MarketAlert[]> {
        return this.marketAlertModel.find({ userId }).exec();
    }
    async getAllActiveAlertsByFrequency(alertFrequency: 'immediate' | 'daily' | 'weekly' = 'immediate'): Promise<MarketAlert[]> {
        return await this.marketAlertModel.find({ 
            isActive: true, 
            alertFrequency: alertFrequency 
        }).exec();
    }

    async updateAlert(alertId: string, updateData: Partial<CreateAlertDto>): Promise<MarketAlert> {
        const updatedAlert = await this.marketAlertModel.findByIdAndUpdate(alertId, updateData, { new: true }).exec();
        if (!updatedAlert) {
            throw new NotFoundException('Alert not found');
        }
        return updatedAlert;
    }

    async deleteAlert(alertId: string): Promise<void> {
        const deletedAlert = await this.marketAlertModel.findByIdAndDelete(alertId).exec();
        if (!deletedAlert) {
            throw new NotFoundException('Alert not found');
        }
    }

    async checkRiskThreshold(
        portfolioId: string,
        condition: ConditionType = ConditionType.GreaterThan,
        threshold: number | [number, number]
    ): Promise<boolean> {
        try {
            const { data } = await this.riskProfileService.getPortfolioRiskDetails(portfolioId);
            const overallRisk = data.overallRisk;
            switch (condition) {
                case ConditionType.GreaterThan:
                    return overallRisk > threshold;
                case ConditionType.LessThan:
                    return overallRisk < threshold;
                case ConditionType.EqualTo:
                    return overallRisk === threshold;
                case ConditionType.InRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return overallRisk >= threshold[0] && overallRisk <= threshold[1];
                    }
                    throw new BadRequestException('Invalid threshold for InRange condition');
                case ConditionType.OutOfRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return overallRisk < threshold[0] || overallRisk > threshold[1];
                    }
                    throw new BadRequestException('Invalid threshold for OutOfRange condition');
                default:
                    throw new BadRequestException('Invalid condition type');
            }

        } catch (error) {
            throw new BadRequestException('Error fetching portfolio risk details');
        }
    }

    async checkMarketDrop(
        assetSymbol: string,
        threshold: number | [number, number],
        condition: ConditionType = ConditionType.GreaterThan
    ): Promise<boolean> {
        try {
            let currentPrice = parseFloat(await this.redisClient.get(`market:price:${assetSymbol}`));
            let historicalPrice = parseFloat(await this.redisClient.get(`market:historical:${assetSymbol}`));

            if (!currentPrice || !historicalPrice) {
                currentPrice = await this.portfolioServiceClient
                    .send({ cmd: 'get_asset_price' }, { assetSymbol })
                    .toPromise();
                
                historicalPrice = await this.portfolioServiceClient
                    .send({ cmd: 'get_historical_price' }, { assetSymbol })
                    .toPromise();
                
                await this.redisClient.set(`market:historical:${assetSymbol}`, historicalPrice, 'EX', 3600);
                await this.redisClient.set(`market:price:${assetSymbol}`, currentPrice, 'EX', 3600);
            }

            const priceDrop = ((historicalPrice - currentPrice) / historicalPrice) * 100;

            switch (condition) {
                case ConditionType.GreaterThan:
                    return priceDrop > (threshold as number);
                case ConditionType.LessThan:
                    return priceDrop < (threshold as number);
                case ConditionType.EqualTo:
                    return priceDrop === (threshold as number);
                case ConditionType.InRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return priceDrop >= threshold[0] && priceDrop <= threshold[1];
                    }
                    throw new BadRequestException(
                        `Threshold must be an array of two numbers for 'InRange' condition`
                    );
                case ConditionType.OutOfRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return priceDrop < threshold[0] || priceDrop > threshold[1];
                    }
                    throw new BadRequestException(
                        `Threshold must be an array of two numbers for 'OutOfRange' condition`
                    );
                default:
                    throw new BadRequestException(`Invalid condition type: ${condition}`);
            }
        } catch (error) {
            console.error('Error in checkMarketDrop:', error.message);
            throw new BadRequestException('Error fetching market data or evaluating conditions');
        }
    }

    async checkPriceIncrease(assetSymbol: string, threshold: number): Promise<boolean> {
        try {
            let currentPrice = await this.redisClient.get(`market:price:${assetSymbol}`);

            if (!currentPrice) {
                currentPrice = await this.portfolioServiceClient
                    .send({ cmd: 'get_asset_price' }, { assetSymbol })
                    .toPromise();

                await this.redisClient.set(`market:price:${assetSymbol}`, currentPrice, 'EX', 3600);
            }

            return parseFloat(currentPrice) >= threshold;
        } catch (error) {
            throw new BadRequestException('Error fetching asset price');
        }
    }

    async checkPriceDecrease(assetSymbol: string, threshold: number): Promise<boolean> {
        try {
            let currentPrice = await this.redisClient.get(`market:price:${assetSymbol}`);

            if (!currentPrice) {
                currentPrice = await this.portfolioServiceClient
                    .send({ cmd: 'get_asset_price' }, { assetSymbol })
                    .toPromise();

                await this.redisClient.set(`market:price:${assetSymbol}`, currentPrice, 'EX', 3600);
            }
            return parseFloat(currentPrice) < threshold;
        } catch (error) {
            throw new BadRequestException('Error fetching asset price');
        }
    }

    async checkFundingProgress(
        campaignId: string,
        condition: ConditionType = ConditionType.GreaterThan,
        threshold: number | [number, number]
    ): Promise<boolean> {
        try {
            const campaign = await this.partVestClient
            .send({ cmd: 'get_campaign_by_id' }, { service :{name:RoleEnum.RISK_SERVICE}, id:campaignId })
                .toPromise();
            const fundingProgress = campaign.fundingProgress;
            switch (condition) {
            case ConditionType.GreaterThan:
                return fundingProgress > threshold;
            case ConditionType.LessThan:
                return fundingProgress < threshold;
            case ConditionType.EqualTo:
                return fundingProgress === threshold;
            case ConditionType.InRange:
                if (Array.isArray(threshold) && threshold.length === 2) {
                    return fundingProgress >= threshold[0] && fundingProgress <= threshold[1];
                }
                throw new BadRequestException(
                    `Threshold must be an array of two numbers for 'InRange' condition`
                );
            case ConditionType.OutOfRange:
                if (Array.isArray(threshold) && threshold.length === 2) {
                    return fundingProgress < threshold[0] || fundingProgress > threshold[1];
                }
                throw new BadRequestException(
                    `Threshold must be an array of two numbers for 'OutOfRange' condition`
                );
            default:
                throw new BadRequestException(`Invalid condition type: ${condition}`);
        }
        } catch (error) {
            throw new BadRequestException('Error fetching campaign funding details');
        }
    }

    async checkVolatility(
        assetSymbol: string,
        condition: ConditionType = ConditionType.GreaterThan,
        threshold: number | [number, number]
    ): Promise<boolean> {
        try {
            let volatility = parseFloat(await this.redisClient.get(`market:volatility:${assetSymbol}`));

        if (!volatility) {
            volatility = await this.portfolioServiceClient
                .send({ cmd: "get_asset_volatility" }, { symbol: assetSymbol })
                .toPromise();

            await this.redisClient.set(`market:volatility:${assetSymbol}`, volatility, 'EX', 3600);
        }
            switch (condition) {
                case ConditionType.GreaterThan:
                    return volatility > (threshold as number);

                case ConditionType.LessThan:
                    return volatility < (threshold as number);

                case ConditionType.EqualTo:
                    return volatility === threshold;

                case ConditionType.InRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return volatility >= threshold[0] && volatility <= threshold[1];
                    }
                    throw new BadRequestException(
                        `Threshold must be an array of two numbers for 'InRange' condition`
                    );

                case ConditionType.OutOfRange:
                    if (Array.isArray(threshold) && threshold.length === 2) {
                        return volatility < threshold[0] || volatility > threshold[1];
                    }
                    throw new BadRequestException(
                        `Threshold must be an array of two numbers for 'OutOfRange' condition`
                    );

                default:
                    throw new BadRequestException(`Invalid condition type: ${condition}`);
            }
        } catch (error) {
            throw new BadRequestException('Error fetching asset volatility');
        }
    }

    async handleAlert(alert: MarketAlert): Promise<boolean> {
        const { alertType, threshold, assetSymbol, condition } = alert;

        switch (alertType) {
            case AlertType.RiskThreshold:
                return await this.checkRiskThreshold(alert.portfolioId, condition, threshold);
            case AlertType.MarketDrop:
                return await this.checkMarketDrop(assetSymbol, threshold, condition);
            case AlertType.PriceIncrease:
                return await this.checkPriceIncrease(assetSymbol, threshold as number);
            case AlertType.PriceDecrease:
                return await this.checkPriceDecrease(assetSymbol, threshold as number);
            case AlertType.VolatilitySpike:
                return await this.checkVolatility(assetSymbol, condition, threshold);
            case AlertType.FundingProgress:
                return await this.checkFundingProgress(alert.campaignId, condition, threshold);
            default:
                throw new Error(`Unsupported risk type: ${alertType}`);
        }
    }
}
