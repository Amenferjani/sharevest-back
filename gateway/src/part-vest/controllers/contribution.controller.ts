import { Controller, Post, Body, Param, Get, Delete, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { CampaignDto, ContributionDto, JwtAuthGuard } from '@amenferjani/shared-lib';
import { Contribution } from '@amenferjani/shared-lib';
import { ContributionService } from '../services/contribution.service';

@Controller('part-vest/contributions')
export class ContributionController {
    constructor(private readonly contributionService: ContributionService) {}

    @Post('campaign/:campaignId')
    @UseGuards(JwtAuthGuard)
    async addContribution(
        @Param('campaignId') campaignId: string,
        @Body() contributionDto: ContributionDto , @Req() req
    ): Promise<Contribution>{
        const user = req.user;
            // console.log({ campaignId, contributionDto  , user})
        return this.contributionService.addContribution(campaignId, contributionDto,user);
    }

    @Get('campaign/:campaignId')
    @UseGuards(JwtAuthGuard) 
    async getContributionsByCampaign(@Param('campaignId') campaignId: string , @Req() req): Promise<Contribution[]> {
        const user = req.user;
        return this.contributionService.getContributionsByCampaign(campaignId,user);
    }

    @Get('campaign/:campaignId/contributor')
    @UseGuards(JwtAuthGuard) 
    async getCampaignContributionsByContributor(@Param('campaignId') campaignId: string , @Req() req) :Promise<Contribution[]>{
        const user = req.user;
        return this.contributionService.getCampaignContributionsByContributor(campaignId, user);
    }

    @Delete(':id/campaign/:campaignId')
    @UseGuards(JwtAuthGuard) 
    async deleteContribution(@Param('id') id: string ,@Param('campaignId') campaignId: string  , @Req() req): Promise<void> {
        const user = req.user;
        return this.contributionService.deleteContribution(id,campaignId,user);
    }

    @Get('get_all_by_contributor')
    @UseGuards(JwtAuthGuard) 
    async getAllByContributor(@Req() req): Promise<Contribution[]> {
        const user = req.user;
        return this.contributionService.getAllByContributor(user.userId);
    }

    @Get('get_six_month_investment_trend')
    @UseGuards(JwtAuthGuard)
    async getSixMonthInvestmentTrend(@Req() req): Promise<{ month: string; amount: number }[]> {
        const user = req.user;
        return this.contributionService.getSixMonthInvestmentTrend(user.userId);
    }
}
