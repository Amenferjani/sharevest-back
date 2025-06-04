import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { HedgeFund, HedgeFundDto } from '@amenferjani/shared-lib';

@Injectable()
export class HedgeFundService {
    constructor(
        @Inject('HEDGE_VEST_SERVICE') private readonly client: ClientProxy,
    ) { }

    async createHedgeFund(
        hedgeFundDto: HedgeFundDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    ): Promise<HedgeFund>{
        return this.client.send('create-hedge-fund', { hedgeFundDto,user }).toPromise();
    }

    async getHedgeFunds(
        user: { userId: string, email: string, roles: { id: string, name: string } },
    ) :Promise<HedgeFund[]>{
        return this.client.send('get-hedge-funds', {user}).toPromise();
    }

    async getHedgeFundById(
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    ) :Promise<HedgeFund>{
        return this.client.send('get-hedge-fund-by-id', { id , user}).toPromise();
    }

    async updateHedgeFund(
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
        hedgeFundDto: HedgeFundDto
    ) :Promise<HedgeFund>{
        return this.client.send('update-hedge-fund', { id, hedgeFundDto , user}).toPromise();
    }

    async deleteHedgeFund(
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    ) {
        return this.client.send('delete-hedge-fund', { id , user}).toPromise();
    }

    async getHedgeFundDetails(
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    ) {
        return this.client.send('get-hedge-fund-details', { id , user}).toPromise();
    }
}
