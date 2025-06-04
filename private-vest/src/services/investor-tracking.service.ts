import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestorTracking } from '@amenferjani/shared-lib';
import { InvestorTrackingDto } from '@amenferjani/shared-lib';

@Injectable()
export class InvestorTrackingService {
    constructor(
        @InjectRepository(InvestorTracking)
        private readonly investorTrackingRepository: Repository<InvestorTracking>,
    ) { }

    async addInvestor(investorTrackingDto: InvestorTrackingDto): Promise<InvestorTracking> {
        const investor = this.investorTrackingRepository.create(investorTrackingDto);
        return this.investorTrackingRepository.save(investor);
    }

    async updateInvestor(id: string, investorTrackingDto: InvestorTrackingDto): Promise<InvestorTracking> {
        const investor = await this.investorTrackingRepository.findOne({ where: { id } });
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        await this.investorTrackingRepository.update(id, investorTrackingDto);

        return this.investorTrackingRepository.findOne({ where: { id } });
    }

    async removeInvestor(id: string): Promise<void> {
        const result = await this.investorTrackingRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Investor not found');
        }
    }

    async getInvestmentsByInvestor(investorId: string): Promise<InvestorTracking[]> {
        const investments = await this.investorTrackingRepository.find({ where: { investorId } });

        if (investments.length === 0) {
            throw new NotFoundException('No investments found for this investor');
        }

        return investments;
    }

    async getInvestorsByDeal(dealId: string): Promise<InvestorTracking[]> {
        const investors = await this.investorTrackingRepository.find({ where: { dealId } });

        if (investors.length === 0) {
            throw new NotFoundException('No investors found for this deal');
        }

        return investors;
    }
}
