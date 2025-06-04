import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Update } from '@amenferjani/shared-lib';

@Injectable()
export class UpdateService {
    constructor(
        @Inject('PART_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async getUpdatesByCampaign(
        id: string,
        user: {
            userId: string;
            email: string;
            roles: { id: string; name: string }[];
        }
    ): Promise<Update[]> {
        try {
            return await this.client
                .send({ cmd: 'get_updates_by_campaign' }, {id,user}) 
                .toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async createUpdate(
        id: string,
        message: string,
        user: {
            userId: string;
            email: string;
            roles: { id: string; name: string }[];
        },
    ): Promise<Update>{
        try {
            return await this.client
                .send({ cmd: 'create_update' }, {id,message,user}) 
                .toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async deleteUpdate(
        id: string,
        updateId: string,
        user: {
            userId: string;
            email: string;
            roles: { id: string; name: string }[];
        },
    ): Promise<void> {
        try {
            await this.client
                .send({ cmd: 'delete_update' }, {id,updateId,user}) 
                .toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}