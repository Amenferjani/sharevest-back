import { Injectable } from '@nestjs/common';
import { Campaign } from '@amenferjani/shared-lib';
import { Contribution } from '@amenferjani/shared-lib';
import { Update } from '@amenferjani/shared-lib';
import { UpdateService } from './update.service';
import { CampaignService } from './campaign.service';
import { ContributionService } from './contribution.service';
@Injectable()
export class CrowdfundingService {
    constructor(
        private readonly updateService: UpdateService,
        private readonly campaignService: CampaignService,
        private readonly contributionService: ContributionService,
    ) { }

    checkHealth(): string {
        return 'crowdfunding service!';
    }

    protected calculateRisk(campaign: Campaign, contributions: Contribution[], updates: Update[]): number {
        let risk = 0;

        const weights = {
            funding: 0.25,
            duration: 0.2,
            successRate: 0.15,
            status: 0.1,
            contributionRange: 0.1,
            category: 0.1,
            updates: 0.1,
        };

        const fundingRatio = (campaign.currentAmount / campaign.targetAmount) * 100;
        const fundingRisk =
            fundingRatio < 50
                ? 1
                : fundingRatio < 75
                ? 0.6
                : fundingRatio < 90
                ? 0.3
                : 0;
        risk += fundingRisk * weights.funding;

        const daysRemaining = Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const timeRisk =
            daysRemaining < 7
                ? 1
                : daysRemaining < 14
                ? 0.7
                : daysRemaining < 30
                ? 0.4
                : 0;
        risk += timeRisk * weights.duration;

        const successRisk = 1 - campaign.successRate; 
        risk += successRisk * weights.successRate;

        const statusRisk = {
            canceled: 1,
            active: 0.5,
            completed: -0.2,
        }[campaign.status] || 0;
        risk += statusRisk * weights.status;

        const avgContribution = contributions.length
            ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length
            : 0;
        const contributionRangeRisk =
            avgContribution < 20
                ? 0.6
                : avgContribution > 100
                ? 0.3
                : 0.1;
        risk += contributionRangeRisk * weights.contributionRange;

        const riskyCategories = ['tech', 'startup', 'new', 'high-risk'];
        const categoryRisk = riskyCategories.includes(campaign.category) ? 0.7 : 0;
        risk += categoryRisk * weights.category;

        const positiveUpdates = updates.filter((u) => u.sentiment === 'positive').length;
        const neutralUpdates = updates.filter((u) => u.sentiment === 'neutral').length;
        const negativeUpdates = updates.length - positiveUpdates - neutralUpdates;

        const sentimentRisk =
            negativeUpdates > positiveUpdates
                ? 1
                : negativeUpdates > 0
                ? 0.5
                : 0;
        const updateEngagementRisk = updates.length < 3 ? 0.6 : 0.1; 

        risk += (sentimentRisk + updateEngagementRisk) * weights.updates;

        if (campaign.targetAmount > 100000) {
            risk += 0.3; 
        }

        risk = Math.max(0, Math.min(risk, 1));

        return risk;
    }

    async getDetails(userId: string): Promise<Array<{ title: string; risk: number }>> {
        const campaigns = await this.campaignService.getCampaignsByOwner(userId)
        if (!campaigns || campaigns.length === 0) {
            return []
        }

        const result: Array<{ title: string; risk: number }> = []

        for (const campaign of campaigns) {
            const contributions = await this.contributionService.getContributionsByCampaign(campaign.id)
            const updates = await this.updateService.getUpdatesByCampaign(campaign.id)

            const risk = this.calculateRisk(campaign, contributions, updates)
            result.push({
                title: campaign.title,
                risk,
            })
        }

        return result
    }

}
