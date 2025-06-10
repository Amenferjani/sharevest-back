import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Investor } from '@amenferjani/shared-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { InvestorDto } from '@amenferjani/shared-lib';
import { CompanyService } from './company.service';

@Injectable()
export class InvestorService {
    constructor(
        @InjectRepository(Investor)
        private readonly investorRepository: Repository<Investor>,
        private readonly companyService: CompanyService,
    ) { }

    async addInvestor(investorDto: InvestorDto): Promise<Investor> {
        const investor = this.investorRepository.create(investorDto);
        return this.investorRepository.save(investor);
    }

    async updateInvestor(id: string, investorDto: InvestorDto): Promise<Investor> {
        const investor = await this.investorRepository.findOne({ where: { id } });
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        await this.investorRepository.update(id, investorDto);
        return this.investorRepository.findOne({ where: { id } });
    }

    async removeInvestor(id: string): Promise<void> {
        const result = await this.investorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Investor not found');
        }
    }

    async getInvestors(filters?: any): Promise<Investor[]> {
        return this.investorRepository.find({ where: filters });
    }

    async getInvestorsByCompany(companyId: string): Promise<Investor[]> {
        return this.investorRepository
            .createQueryBuilder("investor")
            .leftJoinAndSelect("investor.companies", "company")
            .leftJoinAndSelect("investor.events", "event")
            .where("company.id = :companyId", { companyId })
            .getMany();
    }



    async getInvestorById(id: string): Promise<Investor>{
        return await this.investorRepository.findOne({ where: { userId: id }, relations: ['companies','events'], });
    }

    async linkInvestorToCompany(userId: string, companyId: string): Promise<Investor> {
        const company = await this.companyService.getCompanyDetails(companyId);
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        const investor = await this.getInvestorById(userId);
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        if (!investor.companies.some(c => c.id === company.id)) {
            investor.companies.push(company);
        }

        return this.investorRepository.save(investor);
    }


    async unlinkInvestorFromCompany(userId: string, companyId: string): Promise<Investor> {
        const investor = await this.getInvestorById(userId);
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        investor.companies = investor.companies.filter(c => c.id !== companyId);

        return this.investorRepository.save(investor);
    }


    // async getInvestorsByCompany(companyId: string): Promise<Investor[]> {
    //     const company = await this.companyService.getCompanyDetails(companyId);
    //     if (!company) {
    //         throw new NotFoundException('Company not found');
    //     }

    //     return this.investorRepository.find({ where: { companyId: companyId  } });
    // }
}
