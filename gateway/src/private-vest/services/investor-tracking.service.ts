import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InvestorTrackingDto } from '@amenferjani/shared-lib';

@Injectable()
export class InvestorTrackingService {
    constructor(
        @Inject('PRIVATE_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async addInvestor(investorTrackingDto: InvestorTrackingDto, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'add-investor' }, { investorTrackingDto, user }).toPromise();
    }

    async updateInvestor(id: string, investorTrackingDto: InvestorTrackingDto, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'update-investor' }, { id, investorTrackingDto, user }).toPromise();
    }

    async removeInvestor(id: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'remove-investor' }, { id, user }).toPromise();
    }

    async getInvestmentsByInvestor(investorId: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'get-investments-by-investor' }, { investorId, user }).toPromise();
    }

    async getInvestorsByDeal(dealId: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'get-investors-by-deal' }, { dealId, user }).toPromise();
    }
}
