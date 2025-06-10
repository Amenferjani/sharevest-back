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

    async getHedgeFunds(filters?: any): Promise<HedgeFund[]> {
        // return await this.hedgeFundRepository.find();
        const query = this.hedgeFundRepository
            .createQueryBuilder('fund')
            .leftJoinAndSelect('fund.performanceMetrics', 'performanceMetrics');;

        // Normalize "All" to undefined
        const normalizedFilters = {
            name: filters.name !== 'All' ? filters.name : undefined,
            strategy: filters.strategy !== 'All' ? filters.strategy : undefined,
            status: filters.status !== 'All' ? filters.status : undefined,
            inceptionAfter: filters.inceptionAfter !== 'All' ? filters.inceptionAfter : undefined,
        };

        if (normalizedFilters.name) {
            query.andWhere('fund.name ILIKE :name', { name: `%${normalizedFilters.name}%` });
        }

        if (normalizedFilters.strategy) {
            query.andWhere('fund.strategy = :strategy', { strategy: normalizedFilters.strategy });
        }

        if (normalizedFilters.status) {
            query.andWhere('fund.status = :status', { status: normalizedFilters.status });
        }

        if (normalizedFilters.inceptionAfter) {
            query.andWhere('fund.inceptionDate > :inceptionAfter', {
                inceptionAfter: normalizedFilters.inceptionAfter,
            });
        }

        return query.getMany();
    }


    async getHedgeFundById(id: string): Promise<HedgeFund> {
        const hedgeFund = await this.hedgeFundRepository.findOne({ where: { id }, relations: ['performanceMetrics']});
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

    async getHedgeFundDetails(id: string): Promise<HedgeFund>{
        return await this.getHedgeFundById(id);
    }
}