import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CompanyDto, Company } from '@amenferjani/shared-lib';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
    ) { }

    async addCompany(companyDto: CompanyDto): Promise<Company> {
        const company = this.companyRepository.create(companyDto);
        return this.companyRepository.save(company);
    }

    async updateCompany(id: string, companyDto: CompanyDto): Promise<Company> {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        await this.companyRepository.update(id, { ...companyDto, updatedAt: new Date() });
        return this.companyRepository.findOne({ where: { id } });
    }

    async getCompanies(filters: any = {}): Promise<Company[]> {
        console.log("tcp companies service get by filter",filters)
        const where: any = {}

        if (filters.search) {
            where.name = ILike(`%${filters.search}%`)
        }

        if (filters.industry && filters.industry !== 'all') {
            where.industry = filters.industry
        }

        if (filters.status && filters.status !== 'all') {
            where.status = filters.status
        }

        return this.companyRepository.find({
            where,
            order: { createdAt: 'DESC' },
        })
    }


    async getCompanyDetails(id: string): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: {
                events: {
                    investors: true,
                },
                investors: true
            },
        });
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        return company;
    }
    async deleteCompany(id: string) {
        console.log("tcp delete company service method", id);
        try {
            await this.companyRepository.delete(id);
            return { success: true };
        } catch (error) {
            console.log(error)
        }
        
    }

    // async notifyInvestorsForEvent(event: Event): Promise<void> {
    //     if (!event) {
    //         throw new NotFoundException('Event not found');
    //     }

    //     const investors = await this.getInvestorsByCompany(event.company.id);

    //     if (!investors.length) {
    //         console.log(`No investors found for company: ${event.company.name}`);
    //         return;
    //     }

    //     const message = `
    //         📢 New Event Alert: "${event.title}" by ${event.company.name}!
    //         📅 Date: ${event.date.toLocaleString()}
    //         📍 Location: ${event.location || 'Online'}
    //         🔗 Description: ${event.description || 'Join us for this event!'}
    //     `;

    //     investors.forEach((investor) => {
    //         this.relGateway.sendNotificationToInvestor(investor.userId, message);
    //     });

    //     console.log(`Notifications sent to ${investors.length} investors for event: ${event.title}`);
    // }
}
