import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PerformanceMetric } from '@amenferjani/shared-lib';
import { PerformanceMetricDto } from '@amenferjani/shared-lib';
import { HedgeFund } from '@amenferjani/shared-lib';

@Injectable()
export class PerformanceMetricService {
    constructor(
        @InjectRepository(PerformanceMetric)
        private readonly performanceMetricRepository: Repository<PerformanceMetric>,
        @InjectRepository(HedgeFund)
        private readonly hedgeFundRepository: Repository<HedgeFund>,
    ) {}

    async createPerformanceMetric(performanceMetricDto: PerformanceMetricDto): Promise<PerformanceMetric> {
        const performanceMetric = this.performanceMetricRepository.create(performanceMetricDto);
        return this.performanceMetricRepository.save(performanceMetric);
    }

    async getAllPerformanceMetrics(): Promise<PerformanceMetric[]> {
        return this.performanceMetricRepository.find();
    }

    async getMetricsByHedgeFund(hedgeFundId: string): Promise<PerformanceMetric[]> {
        return this.performanceMetricRepository.find({ where: {hedgeFund:{id: hedgeFundId }} ,relations:['HedgeFund'] });
    }

    async updatePerformanceMetric(id: string, performanceMetricDto: PerformanceMetricDto): Promise<PerformanceMetric> {
        await this.performanceMetricRepository.update(id, performanceMetricDto);
        const updatedPerformanceMetric = await this.performanceMetricRepository.findOne({where :{id}});
        if (!updatedPerformanceMetric) {
            throw new NotFoundException('Performance Metric not found');
        }
        return updatedPerformanceMetric;
    }

    async deletePerformanceMetric(id: string): Promise<void> {
        const result = await this.performanceMetricRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Performance Metric not found');
        }
    }

    async getLatestPerformanceMetrics(hedgeFundId: string): Promise<PerformanceMetric> {
        const latestMetric = await this.performanceMetricRepository
            .createQueryBuilder('performanceMetric')
            .where('performanceMetric.hedgeFundId = :hedgeFundId', { hedgeFundId })
            .orderBy('performanceMetric.date', 'DESC')
            .limit(1)
            .getOne();

        if (!latestMetric) {
            throw new NotFoundException('No performance metrics found for this hedge fund');
        }

        return latestMetric;
    }
    async generatePerformanceReport(hedgeFundId: string): Promise<any> {
        const performanceMetrics = await this.performanceMetricRepository.find({
            where: { hedgeFund: { id: hedgeFundId } },
            order: { date: 'ASC' },
            relations:['hedgeFund']
        });
        if (!performanceMetrics.length) {
            throw new NotFoundException('No performance metrics found for the specified hedge fund');
        }
        const totalReturns = performanceMetrics.reduce((sum, metric) => sum + metric.returnPercentage, 0);
        const averageReturn = totalReturns / performanceMetrics.length;
        const latestMetric = performanceMetrics[performanceMetrics.length - 1];
        const volatilityTrend = performanceMetrics.map((metric) => metric.volatility);
        const report = {
            hedgeFundName: latestMetric.hedgeFund.name,
            strategy: latestMetric.hedgeFund.strategy,
            manager: latestMetric.hedgeFund.manager,
            totalAssets: latestMetric.hedgeFund.totalAssets,
            performanceSummary: {
                latestPerformance: {
                    date: latestMetric.date,
                    returnPercentage: latestMetric.returnPercentage,
                    sharpeRatio: latestMetric.sharpeRatio,
                    volatility: latestMetric.volatility,
                    drawdown: latestMetric.drawdown,
                    riskScore: latestMetric.riskScore,
                },
                averageReturn,
                volatilityTrend,
            },
        };

        return report;
    }

    async trackPerformanceOverTime(
        hedgeFundId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<PerformanceMetric[]> {
        const whereConditions: any = { HedgeFund: { id: hedgeFundId } };
        if (startDate && endDate) {
            whereConditions.date = Between(startDate, endDate);
        }

        const performanceMetrics = await this.performanceMetricRepository.find({
            where: whereConditions,
            order: { date: 'ASC' },
        });

        if (!performanceMetrics.length) {
            throw new NotFoundException('No performance metrics found for the specified criteria.');
        }

        return performanceMetrics;
    }
}