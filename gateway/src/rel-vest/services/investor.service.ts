import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InvestorDto } from '@amenferjani/shared-lib';

@Injectable()
export class InvestorService {
    constructor(@Inject('REL_VEST_SERVICE') private readonly client: ClientProxy) {}

    async addInvestor(investorDto: InvestorDto, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'addInvestor' }, { investorDto, user }).toPromise();
    }

    async updateInvestor(id: string, investorDto: InvestorDto, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'updateInvestor' }, { id, investorDto, user }).toPromise();
    }

    async removeInvestor(id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'removeInvestor' }, { id, user }).toPromise();
    }

    async getInvestors(filters: any, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'getInvestors' }, { filters, user }).toPromise();
    }

    async getInvestorById(user: { userId: string, email: string, roles: { id: string, name: string } }) {
        console.log("http investor by id ")
        return this.client.send({ cmd: 'getInvestorById' }, { user }).toPromise();
    }

    async getInvestorsByCompany(companyId: string, user: { userId: string, email: string, roles: { id: string, name: string } }) {
        console.log("http investor by company ")
        return this.client.send({ cmd: 'getInvestorByCompany' }, { companyId,user }).toPromise();
    }

    async linkInvestorToCompany(companyId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'linkInvestorToCompany' }, { companyId, user }).toPromise();
    }

    async unlinkInvestorFromCompany(companyId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'unlinkInvestorFromCompany' }, { companyId, user }).toPromise();
    }
    

}
