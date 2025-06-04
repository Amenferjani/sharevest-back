import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '@amenferjani/shared-lib';
import { InvestmentDto } from '@amenferjani/shared-lib';

@Injectable()
export class InvestmentService {
    constructor(
        @InjectRepository(Investment)
        private readonly investmentRepository: Repository<Investment>,
    ) {}

    async createInvestment(investmentDto: InvestmentDto): Promise<Investment> {
        const investment = this.investmentRepository.create(investmentDto);
        return this.investmentRepository.save(investment);
    }

    async getAllInvestments(): Promise<Investment[]> {
        return this.investmentRepository.find({
            relations: ['hedgeFund'],
        });
    }

    async getInvestmentsByHedgeFund(hedgeFundId: string): Promise<Investment[]> {
        return this.investmentRepository.find({ where: { hedgeFund: { id: hedgeFundId } } });
    }

    async updateInvestment(id: string, investmentDto: InvestmentDto): Promise<Investment> {
        const investment = await this.investmentRepository.findOne({ where: { id:id } });
        if (!investment) {
            throw new NotFoundException('Investment not found');
        }
        console.log(investment)

        await this.investmentRepository.update(id, investmentDto);
        return this.investmentRepository.findOne({ where: { id } });
    }

    async deleteInvestment(id: string): Promise<void> {
        const investment = await this.investmentRepository.findOne({ where: { id } });
        if (!investment) {
            throw new NotFoundException('Investment not found');
        }

        await this.investmentRepository.delete(id);
    }

    async updateInvestmentStatus(id: string, status: string): Promise<Investment>{
        const validStatuses = ['pending', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestException(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
        }

        const investment = await this.investmentRepository.findOne({ where: { id } });
        if (!investment) {
            throw new NotFoundException('Investment not found');
        }

        investment.status = status;

        await this.investmentRepository.save(investment);

        return investment;
    }

    async getInvestmentsByInvestor(investorId: string): Promise<Investment[]> {
        const investments = await this.investmentRepository.find({ where: { investorId },relations:['HedgeFund'] });

        if (investments.length === 0) {
            throw new NotFoundException('No investments found for this investor');
        }

        return investments;
    }
}
