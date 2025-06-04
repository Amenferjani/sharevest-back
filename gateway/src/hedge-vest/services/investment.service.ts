import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Investment, InvestmentDto } from '@amenferjani/shared-lib';

@Injectable()
export class InvestmentService {
    constructor(
        @Inject('HEDGE_VEST_SERVICE') private readonly client: ClientProxy,
    ) { }

    async createInvestment(
        investmentDto: InvestmentDto,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'create-investment'}, { investmentDto, user }).toPromise();
    }

    async getAllInvestments(
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) : Promise<Investment[]>{
        return this.client.send({cmd:'get-all-investments'}, { user }).toPromise();
    }

    async getInvestmentsByInvestor(
        investorId: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'get-investments-by-investor'}, { investorId, user }).toPromise();
    }

    async updateInvestment(
        id: string,
        investmentDto: InvestmentDto,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'update-investment'}, { id, investmentDto, user }).toPromise();
    }

    async updateInvestmentStatus(
        id: string,
        status: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd:'update-investment-status'}, { id, status, user }).toPromise();
    }

    async deleteInvestment(
        id: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd:'delete-investment'}, { id, user }).toPromise();
    }
}
