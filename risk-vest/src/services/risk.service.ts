import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject, ConflictException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskProfile } from '@amenferjani/shared-lib';
import { RiskProfileDto } from '@amenferjani/shared-lib';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class RiskProfileService {
    constructor(
        @InjectModel(RiskProfile.name) private riskProfileModel: Model<RiskProfile>,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
        @Inject('PORTFOLIO_SERVICE') private readonly portfolioClient: ClientProxy,
        @Inject('PART_VEST_SERVICE') private readonly partVestClient: ClientProxy,
    ) {}

    async create(riskProfileDto: RiskProfileDto): Promise<RiskProfile> {
        const existingRiskProfile = await this.riskProfileModel.findOne({ userId: riskProfileDto.userId }).exec();
        console.log("risk tcp service creating :",riskProfileDto)
        if (existingRiskProfile) {
            throw new ConflictException('A risk profile already exists for this user');
        }

        const newRiskProfile = new this.riskProfileModel(riskProfileDto);

        if (riskProfileDto.riskType !== undefined) {
            switch (riskProfileDto.riskType) {
                case 'low':
                    newRiskProfile.score = 20;
                    break;
                case 'medium':
                    newRiskProfile.score = 50;
                    break;
                case 'high':
                    newRiskProfile.score = 80;
                    break;
                default:
                    throw new Error('Invalid risk type');
            }
        }

        return newRiskProfile.save();
    }


    async findAll(): Promise<RiskProfile[]> {
        return this.riskProfileModel.find().exec();
    }

    async findById(id: string): Promise<RiskProfile> {
        const riskProfile = await this.riskProfileModel.findById(id).exec();
        if (!riskProfile) {
            throw new NotFoundException('Risk profile not found');
        }
        return riskProfile;
    }

    async delete(id: string): Promise<RiskProfile> {
        const deletedRiskProfile = await this.riskProfileModel.findByIdAndDelete(id).exec();
        if (!deletedRiskProfile) {
            throw new NotFoundException('Risk profile not found');
        }
        return deletedRiskProfile;
    }

    async updateRiskProfile(
        userId: string,
        dto: Partial<RiskProfileDto>
    ): Promise<RiskProfile> {
        const updatedRiskProfile = await this.riskProfileModel
            .findOneAndUpdate(
            { userId },
            { 
                $set: {
                ...dto,
                updatedAt: new Date()
                }
            },
            { new: true, runValidators: true }
            )
            .exec();

        if (!updatedRiskProfile) {
            throw new NotFoundException('Risk profile not found');
        }

        return updatedRiskProfile;
    }

    async getRiskProfile(userId: string): Promise<RiskProfile> {
        console.log("risk tcp service ")
        const riskProfile = await this.riskProfileModel.findOne({ userId }).exec();
        console.log("risk tcp service ",riskProfile)
        if (!riskProfile) {
            throw new RpcException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Risk profile not found'
            });
        }
        return riskProfile;
    }

    async getPortfolioRiskDetails(userId: string): Promise<any> {
    try {
        const response = await this.portfolioClient.send({ cmd: 'get_portfolio_details' }, { userId:userId }).toPromise();
        const { investmentStrategy, assetsRisk, transactionsRisk, overallRisk } = response;

        if (!investmentStrategy || assetsRisk === undefined || transactionsRisk === undefined || overallRisk === undefined) {
            throw new BadRequestException('Response data is missing required fields');
        }

        return { investmentStrategy, assetsRisk, transactionsRisk, overallRisk };
    } catch (error) {
        throw new InternalServerErrorException('Could not fetch portfolio details');
    }
}

    async getCrowdfundingRiskDetails(userId: string): Promise<Array<{ title: string; risk: number }>> {
        try {
            const response = await this.partVestClient
            .send({ cmd: 'get_risk' }, { userId })
            .toPromise();
            if (!Array.isArray(response)) {
            throw new BadRequestException('Expected an array of crowdfunding risks');
            }

            if (response.length === 0) {
            return [];
            }

            return response as Array<{ title: string; risk: number }>;
        } catch (err) {
            console.log(err)
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new InternalServerErrorException('Could not fetch crowdfunding details');
        }
    }

    async getUserRiskDetails(userId: string): Promise<any> {
    console.log( "getUserRiskDetails : ")
    try {
        const response = await this.userClient.send({ cmd: 'get_user_risk' }, { id: userId }).toPromise();
        const { riskTolerance, overallRiskScore } = response;
        console.log("response",response)
        if (riskTolerance === undefined || overallRiskScore === undefined) {
            throw new BadRequestException('Response data is missing required fields');
        }

        return { riskTolerance, overallRiskScore };
    } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Could not fetch user details');
    }
}

    async suggestRiskProfileChange(userId: string): Promise<string> {
        const portfolioRisk = await this.getPortfolioRiskDetails(userId);
        const riskProfile = (await this.getRiskProfile(userId)).toObject();
        console.log("portfolioRisk.overallRisk :", portfolioRisk.overallRisk)
        console.log("riskProfile.riskType",riskProfile.riskType)
        if (portfolioRisk.overallRisk > 80 && riskProfile.riskType !== 'high') {
            return 'Consider adjusting your risk profile to High based on portfolio performance.';
        } else if (portfolioRisk.overallRisk < 40 && riskProfile.riskType !== 'low') {
            return 'Consider adjusting your risk profile to Low based on portfolio performance.';
        }

        return 'Your risk profile seems appropriate based on current portfolio performance.';
    }

    async getAggregatedRiskDetails(userId: string): Promise<any> {
        try {
            const portfolioRisk = await this.getPortfolioRiskDetails(userId);
            const userRisk = await this.getUserRiskDetails(userId);
            const riskProfile = (await this.getRiskProfile(userId)).toObject();

            const willingnessToTakeRisk = riskProfile.score;
            const adjustedWillingness = this.calculateUserAdjustedRisk(willingnessToTakeRisk, userRisk, riskProfile);
            const portfolioAdjustment = this.calculatePortfolioAdjustment(portfolioRisk);

            let aggregatedRiskScore =
                adjustedWillingness * 0.4 + portfolioAdjustment * 0.4;

            aggregatedRiskScore = Math.max(0, Math.min(aggregatedRiskScore, 100));

            const visualizationData = {
                portfolioChart: [portfolioRisk.assetsRisk, portfolioRisk.transactionsRisk],
                userRiskGauge: userRisk.riskTolerance,
                willingnessGauge: adjustedWillingness,
                aggregatedRiskGauge: aggregatedRiskScore,
            };

            return {
                portfolioRisk,
                userRisk,
                riskProfile: { ...riskProfile, adjustedWillingness },
                aggregatedRiskScore,
                visualizationData,
            };
        } catch (error) {   
            throw new InternalServerErrorException('Could not fetch aggregated risk details');
        }
    }

    async getAdjustedCrowdfundingRiskForUser(
        userId: string
        ): Promise<
        Array<{
            title: string
            baseRisk: number
            adjustedRisk: number
        }>
    > {
        try {
        console.log("Fetching adjusted crowdfunding risk for user tcp service:", userId);
            
            const rawList: Array<{ title: string; risk: number }> = await this.getCrowdfundingRiskDetails(userId)
            if (!Array.isArray(rawList) || rawList.length === 0) {
                return []
            }

            const userRisk = await this.getUserRiskDetails(userId)
            const riskProfile = (await this.getRiskProfile(userId)).toObject()

            return rawList.map(({ title, risk: baseRisk }) => {
                const adjustedRisk = this.calculateUserAdjustedRisk(baseRisk, userRisk, riskProfile)

                return {
                    title, 
                    baseRisk,
                    adjustedRisk,
                }
            })

        } catch (error) {
            throw new InternalServerErrorException(
            "Could not calculate adjusted crowdfunding risk for user"
            )
        }
    }


    protected calculateUserAdjustedRisk(
        baseRisk: number,
        userRisk: { riskTolerance: number; overallRiskScore: number },
        riskProfile: {
            timeHorizon: string;
            investmentGoals: string[];
            financialSituation: { income: number; netWorth: number; investmentExperience: string };
            preferences: { assetClasses: string[]; ethicalInvesting: boolean };
            liquidityNeeds: number;
            debtLevel: number;
            taxStatus: string;
        }
    ): number {
        let adjustedRisk = baseRisk;

        adjustedRisk += riskProfile.liquidityNeeds * 0.05;

        adjustedRisk += riskProfile.debtLevel * 0.1;

        if (riskProfile.taxStatus === 'married') {
            adjustedRisk -= 0.1;
        } else if (riskProfile.taxStatus === 'joint') {
            adjustedRisk += 0.05;
        }

        const riskToleranceModifier = userRisk.riskTolerance;
        adjustedRisk *= riskToleranceModifier / 2;

        if (userRisk.overallRiskScore > 70) {
            adjustedRisk -= 0.1;
        } else if (userRisk.overallRiskScore < 30) {
            adjustedRisk += 0.1;
        }

        if (riskProfile.timeHorizon === 'short-term') {
            adjustedRisk += 0.2;
        } else if (riskProfile.timeHorizon === 'long-term') {
            adjustedRisk -= 0.1;
        }

        if (riskProfile.investmentGoals.includes('wealth preservation')) {
            adjustedRisk += 0.1;
        } else if (riskProfile.investmentGoals.includes('high growth')) {
            adjustedRisk -= 0.1;
        }

        const { income, netWorth, investmentExperience } = riskProfile.financialSituation;
        if (netWorth < 50000) {
            adjustedRisk += 0.2;
        } else if (netWorth > 200000) {
            adjustedRisk -= 0.1;
            if (income > 100000) {
                adjustedRisk -= 0.05;
            }
        }

        if (investmentExperience === 'beginner') {
            adjustedRisk += 0.2;
        } else if (investmentExperience === 'expert') {
            adjustedRisk -= 0.2;
        }

        const { assetClasses, ethicalInvesting } = riskProfile.preferences;
        if (ethicalInvesting) {
            adjustedRisk += 0.05;
        }

        const assetClassRisks: { [key: string]: number } = {
            'high-risk': 0.2,
            bonds: -0.1,
            'real-estate': -0.05,
            stocks: 0.1,
            crypto: 0.3,
            gold: -0.05,
            'mutual-funds': 0.05,
            commodities: 0.1,
            ETFs: 0.05,
            'startup-equity': 0.25,
        };

        assetClasses.forEach((assetClass) => {
            if (assetClassRisks[assetClass]) {
                adjustedRisk += assetClassRisks[assetClass];
            }
        });

        return Math.max(0, Math.min(adjustedRisk, 1));
    }

    protected calculatePortfolioAdjustment(portfolioRisk: {
        overallRisk: number;
        assetsRisk: number;
        transactionsRisk: number;
    }): number {
        let portfolioAdjustment = 0;

        if (portfolioRisk.overallRisk > 80) {
            portfolioAdjustment += 15;
        } else if (portfolioRisk.overallRisk > 60) {
            portfolioAdjustment += 10;
        } else if (portfolioRisk.overallRisk < 20) {
            portfolioAdjustment -= 10;
        } else if (portfolioRisk.overallRisk < 40) {
            portfolioAdjustment -= 5;
        }

        if (portfolioRisk.assetsRisk > 70) {
            portfolioAdjustment += 5;
        }

        if (portfolioRisk.transactionsRisk > 50) {
            portfolioAdjustment += 5;
        }

        return portfolioAdjustment;
    }
}