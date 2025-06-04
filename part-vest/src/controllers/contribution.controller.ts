import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContributionDto, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';
import { Contribution } from '@amenferjani/shared-lib';
import { ContributorGuard } from 'src/guards/contributor.guard';
import { ContributionService } from 'src/services/contribution.service';

@Controller()
export class ContributionController {
    constructor(private readonly contributionService: ContributionService) {}

    @MessagePattern({ cmd: 'add_contribution' })
    async addContribution(
        @Payload() payload: {
            campaignId: string, contributionDto: ContributionDto,
            user:
            {
                userId: string, email: string, roles: { id: string, name: string }
            },
        }
    ): Promise<any> {
        const { campaignId, contributionDto ,user} = payload;
        return this.contributionService.addContribution(campaignId,{
            ...contributionDto,
            campaignId,
            userId: user.userId,
        });
    }

    @MessagePattern({ cmd: 'get_contributions_by_campaign' })
    @Roles(RoleEnum.ADMIN, RoleEnum.CAMPAIGN_MANAGER,RoleEnum.CAMPAIGN_CONTRIBUTOR)
    @UseGuards(ContributorGuard)
    async getContributionsByCampaign(
        @Payload() payload: {
            id: string,
            user:
            {
                userId: string, email: string, roles: { id: string, name: string }
            },
        }
    ): Promise<Contribution[]> {
        const { id } = payload;
        return this.contributionService.getContributionsByCampaign(id);
    }

    @MessagePattern({ cmd: 'delete_contribution' })
    @Roles(RoleEnum.CAMPAIGN_CONTRIBUTOR,RoleEnum.CAMPAIGN_MANAGER,RoleEnum.CAMPAIGN_CONTRIBUTOR)
    @UseGuards(ContributorGuard)
    async deleteContribution(
        @Payload() payload: {
            id: string,
            contributionId:string,
            user:
            {
                userId: string, email: string, roles: { id: string, name: string }
            },
        }
    ): Promise<void> {
        const { contributionId } = payload;
        await this.contributionService.deleteContribution(contributionId);
    }

    @MessagePattern({ cmd: 'get_campaign_contributions_by_contributor' })
    @Roles(RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getCampaignContributionsByContributor(
        @Payload() payload: {
            campaignId: string,
            user:
            {
                userId: string, email: string, roles: { id: string, name: string }
            },
        }
    ): Promise<Contribution[]> {
        const { campaignId , user } = payload;
        return this.contributionService.getCampaignContributionsByContributor(campaignId , user.userId);
    }

    @MessagePattern({ cmd: 'get_all_by_contributor' })
    async getAllByContributor(@Payload() payload: {
        userId: string,
    }) {
        const { userId } = payload;
        return this.contributionService.getAllByContributor(userId);
    }

    @MessagePattern({ cmd: 'get_six_month_investment_trend'})
    async  getSixMonthInvestmentTrend(@Payload() payload: {
        userId: string,
    }) {
        const { userId } = payload;
        return this.contributionService.getSixMonthInvestmentTrend(userId);
    }
}
