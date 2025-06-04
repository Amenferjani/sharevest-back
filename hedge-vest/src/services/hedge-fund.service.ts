import {  forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HedgeFund } from '@amenferjani/shared-lib';
import { HedgeFundDto } from '@amenferjani/shared-lib';
import { PerformanceMetric } from '@amenferjani/shared-lib';
import { PerformanceMetricService } from './performance-metric.service';

@Injectable()
export class HedgeFundService {
    constructor(
        @InjectRepository(HedgeFund)
        private readonly hedgeFundRepository: Repository<HedgeFund>,
        @Inject(forwardRef(() => PerformanceMetricService)) private readonly performanceMetricService: PerformanceMetricService,
    ) { }

    async createHedgeFund(hedgeFundDto: HedgeFundDto): Promise<HedgeFund> {
        const hedgeFund = this.hedgeFundRepository.create(hedgeFundDto);
        return this.hedgeFundRepository.save(hedgeFund);
    }

    async getHedgeFunds(): Promise<HedgeFund[]> {
        return this.hedgeFundRepository.find();
    }

    async getHedgeFundById(id: string): Promise<HedgeFund> {
        const hedgeFund = await this.hedgeFundRepository.findOne({where:{id}});
        if (!hedgeFund) {
            throw new NotFoundException('Hedge Fund not found');
        }
        return hedgeFund;
    }

    async updateHedgeFund(id: string, hedgeFundDto: HedgeFundDto): Promise<HedgeFund> {
        await this.hedgeFundRepository.update(id, hedgeFundDto);
        const updatedHedgeFund = await this.hedgeFundRepository.findOne({where:{id}});
        if (!updatedHedgeFund) {
            throw new NotFoundException('Hedge Fund not found');
        }
        return updatedHedgeFund;
    }

    async deleteHedgeFund(id: string): Promise<void> {
        const result = await this.hedgeFundRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Hedge Fund not found');
        }
    }

    async getHedgeFundDetails(id: string): Promise<any>{
        const fund = this.getHedgeFundById(id);
        const performanceMetrics = await this.performanceMetricService.getMetricsByHedgeFund(id);
        return {
            fund: fund,
            performanceMetrics: performanceMetrics,
        };
    }
}