import { CompanyDto, Company } from '@amenferjani/shared-lib';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class CompanyService {
    constructor(
        @Inject('REL_VEST_SERVICE') private readonly client: ClientProxy,
    ) { }

    async addCompany(companyDto: CompanyDto, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'add_company' }, { companyDto, user });
    }

    async updateCompany(id: string, companyDto: CompanyDto, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'update_company' }, { id, companyDto, user });
    }

    async getCompanies(filters: any, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'get_companies' }, { filters, user });
    }

    async getCompanyDetails(id: string, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'get_company_details' }, { id, user });
    }
    
    async deleteCompany(id: string, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        try {
            return this.client.send({ cmd: 'delete_company' }, { id, user });
        } catch (error) {
            console.log(error)
            throw new RpcException(error);
        }
    }
}