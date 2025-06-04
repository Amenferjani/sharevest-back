import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DealDto } from '@amenferjani/shared-lib';

@Injectable()
export class DealService {
    constructor(
        @Inject('PRIVATE_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async createDeal(dealDto: DealDto, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'create-deal' }, { dealDto, user }).toPromise();
    }

    async updateDeal(id: string, dealDto: DealDto, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'update-deal' }, { id, dealDto, user }).toPromise();
    }

    async deleteDeal(id: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'delete-deal' }, { id, user }).toPromise();
    }

    async getDealList(filters: any, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'get-deal-list' }, { filters, user }).toPromise();
    }

    async getDealDetails(id: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'get-deal-details' }, { id, user }).toPromise();
    }

    async getTopDeals(filters: any, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return this.client.send({ cmd: 'get-top-deals' }, { filters, user }).toPromise();
    }

}
