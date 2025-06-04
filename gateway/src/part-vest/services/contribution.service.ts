import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CampaignDto, ContributionDto, UpdateDto } from '@amenferjani/shared-lib';
import { Campaign } from '@amenferjani/shared-lib';
import { Contribution } from '@amenferjani/shared-lib';
import { Update } from '@amenferjani/shared-lib';

@Injectable()
export class ContributionService {
    constructor(
        @Inject('PART_VEST_SERVICE') private readonly client: ClientProxy
    ) { }

    async addContribution(campaignId: string, contributionDto: ContributionDto,
        user:
        {
            userId: string, email: string, roles: { id: string, name: string }
        },
    ): Promise<Contribution> {
        try {
            return await this.client.send({ cmd: 'add_contribution' }, { campaignId, contributionDto  , user}).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getContributionsByCampaign(campaignId: string,
        user:
        {
            userId: string, email: string, roles: { id: string, name: string }
    }): Promise<Contribution[]> {
        try {
            console.log(campaignId)
            return await this.client.send({ cmd: 'get_contributions_by_campaign' }, {id:campaignId , user}).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getCampaignContributionsByContributor(campaignId: string, user: {
        userId: string;
        email: string;
        roles: { id: string; name: string }[];
    }): Promise<Contribution[]> {
        try {
        console.log("http service : ", user, "campaign", campaignId);
            return await this.client.send({ cmd: 'get_campaign_contributions_by_contributor' }, {  campaignId, user }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async deleteContribution(contributionId: string ,campaignId:string ,user: {
            userId: string;
            email: string;
            roles: { id: string; name: string }[];
        }): Promise<void> {
        try {
            await this.client.send({ cmd: 'delete_contribution' },{ contributionId , id:campaignId,user}).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getAllByContributor(userId: string): Promise<Contribution[]> {
        try {
            return await this.client.send({ cmd: 'get_all_by_contributor' }, { userId }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getSixMonthInvestmentTrend(userId: string): Promise<{ month: string; amount: number }[]>{
        try {
            return await this.client.send({ cmd: 'get_six_month_investment_trend'}, { userId }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
