import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CampaignDto, Update, UpdateDto } from '@amenferjani/shared-lib';
import { Campaign } from '@amenferjani/shared-lib';

@Injectable()
export class CampaignService {
    constructor(
        @Inject('PART_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async createCampaign(
        user: { userId: string, email: string, roles: { id: string, name: string } },
        campaignDto: CampaignDto)
    : Promise<Campaign>{
        try {
            console.log(user,campaignDto)
        return await this.client
            .send({ cmd: 'create_campaign' }, { user, campaignDto })
            .toPromise();
        } catch (error) {
        throw new RpcException(error);
        }
    }

    async getCampaigns({ user }: { user: any }): Promise<Campaign[]> {
        try {
        return await this.client
            .send({ cmd: 'get_campaigns' }, { user })
            .toPromise();
        } catch (error) {
        throw new RpcException(error);
        }
    }

    async getCampaignById({
        user,
        id,
    }: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
        id: string,
    }): Promise<Campaign> {
        try {
        return await this.client
            .send({ cmd: 'get_campaign_by_id' }, { user, id })
            .toPromise();
        } catch (error) {
        throw new RpcException(error);
        }
    }

    async updateCampaign(
        user: { userId: string, email: string, roles: { id: string, name: string } },
        id: string,
        campaignDto: Partial<CampaignDto>,
    ): Promise<{campaign : Campaign}>  {
        try {
            console.log(user,id,campaignDto)
            return await this.client
                .send({ cmd: 'update_campaign' }, { user, id, campaignDto})
                .toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async deleteCampaign({
        user,
        id,
    }: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
        id: string,
    }): Promise<{ message: string }> {
        try {
        return await this.client
            .send({ cmd: 'delete_campaign' }, { user, id })
            .toPromise();
        } catch (error) {
        throw new RpcException(error);
        }
    }

    async getCampaignsByOwner(
        user:{ userId: string, email: string, roles: { id: string, name: string } },
        ): Promise<Campaign>{
        console.log("http service user :" , user)
        try {
            return await this.client
                .send({ cmd: "get_campaigns_by_owner" }, { user })
                .toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getRecentCampaigns(
        data:{
            page: number,
            limit: number
        }
    ): Promise<Campaign[]> {
        try {
            return await this.client.send({ cmd: 'get_recent_campaigns' },data).toPromise() 
        } catch (error) {
            throw new RpcException(error)
        }
    }

    async getCampaignsByUiFilters(data: {
        category?: string,
        progressRange?: string,
        daysLeftRange?: string,
        limit?: number

    }) : Promise<Campaign[]> {
        try {
            return await this.client.send({ cmd: 'get_campaigns_by_ui_filters' },data).toPromise() 
        } catch (error) {
            throw new RpcException(error)
        }
    }
}