import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '@amenferjani/shared-lib';
import { DealDto } from '@amenferjani/shared-lib'; 

@Injectable()
export class DealService {
    constructor(
        @InjectRepository(Deal)
        private readonly dealRepository: Repository<Deal>,
    ) {}

    async createDeal(dealDto: DealDto): Promise<Deal> {
        const deal = this.dealRepository.create(dealDto);
        return this.dealRepository.save(deal);
    }

    async updateDeal(id: string, dealDto: DealDto): Promise<Deal> {
        const deal = await this.dealRepository.findOne({ where: { id } });
        if (!deal) {
            throw new NotFoundException('Deal not found');
        }

        await this.dealRepository.update(id, dealDto);

        return this.dealRepository.findOne({ where: { id } });
    }

    async deleteDeal(id: string): Promise<void> {
        const result = await this.dealRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Deal not found');
        }
    }

    async getDealList(filters?: any): Promise<Deal[]> {
        if (filters) {
            return this.dealRepository.find({
                where: filters,
            });
        }
        return this.dealRepository.find();
    }

    async getDealDetails(id: string): Promise<Deal> {
        const deal = await this.dealRepository.findOne({ where: { id } });
        if (!deal) {
            throw new NotFoundException('Deal not found');
        }
        return deal;
    }

    async getTopDeals(filters?: any): Promise<Deal[]> {
        const queryBuilder = this.dealRepository.createQueryBuilder('deal');

        if (filters) {
            if (filters.status) {
                queryBuilder.andWhere('deal.status = :status', { status: filters.status });
            }

            if (filters.industry) {
                queryBuilder.andWhere('deal.industry = :industry', { industry: filters.industry });
            }

            if (filters.topInvestment) {
                queryBuilder.andWhere('deal.currentInvestment >= :topInvestment', { topInvestment: filters.topInvestment });
            }
        }

        queryBuilder.orderBy('deal.currentInvestment', 'DESC');  // Sorting by the current investment, you can change this
        queryBuilder.take(10);  // Fetch top 10 deals
        return await queryBuilder.getMany();
    }
}
