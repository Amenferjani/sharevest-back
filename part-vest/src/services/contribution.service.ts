import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contribution } from '@amenferjani/shared-lib'; 
import { ContributionDto } from '@amenferjani/shared-lib';
import { CampaignService } from './campaign.service';
import { UpdateService } from './update.service';

@Injectable()
export class ContributionService {
    constructor(
        @InjectModel(Contribution.name) private contributionModel: Model<Contribution>,
        private readonly campaignService: CampaignService,
        private readonly updateService: UpdateService,
    ) {}

    async addContribution(campaignId: string, contributionDto: ContributionDto): Promise<any> {
        console.log(campaignId, contributionDto);

        const campaign = await this.campaignService.getCampaignById(campaignId);
        if (!campaign) throw new NotFoundException('Campaign Not Found');

        const frequency = await this.getFrequency(contributionDto.userId)

        const contribution = new this.contributionModel({ ...contributionDto, campaignId: campaign._id , frequency : frequency + 1 });
        campaign.currentAmount += contributionDto.amount;
        campaign.fundingProgress = campaign.currentAmount / campaign.targetAmount; 

        await campaign.save();
        const savedContribution = await contribution.save();

            const updateDto = {
            campaignId:campaignId,
            message: `A contribution of ${contributionDto.amount} has been made to the campaign.`,
        };
        const savedUpdate = await this.updateService.addUpdate(updateDto);

        await this.campaignService.addUpdateToCampaign(campaignId, savedUpdate._id as Types.ObjectId);

        return savedContribution;
    }

    protected async getFrequency(contributorId: string): Promise<number> {
        const contributions = await this.contributionModel
            .find({ userId: contributorId })
            .exec();
        const frequency = contributions.length;
        return frequency;
    }

    async getContributionsByCampaign(campaignId: string): Promise<Contribution[]> {
        const contributions = await this.contributionModel
            .find({ campaignId: new Types.ObjectId(campaignId) })
            .sort({date : -1})
            .exec();
        return contributions;
    }

    async deleteContribution(id: string): Promise<void> {
        const contribution = await this.contributionModel.findByIdAndDelete(id).exec();
        if (!contribution) throw new NotFoundException('Contribution not found');
    }

    async getCampaignContributionsByContributor(campaignId: string, userId: string): Promise<Contribution[]> {
        const contributions = await this.contributionModel
            .find({ campaignId: new Types.ObjectId(campaignId), userId })
            .sort({ date: -1 })
            .exec();
        return contributions;
    }
    async getAllByContributor(userId: string): Promise<Contribution[]> {
        const contributions = await this.contributionModel
            .find({userId})
            .exec();
        return contributions;
    }

    async getSixMonthInvestmentTrend(userId: string): Promise<{ month: string; amount: number }[]> {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const raw = await this.contributionModel
        .aggregate([
            {
            $match: {
                userId: userId,
                date: { $gte: startDate },
            },
            },
            {
            $group: {
                _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                },
                total: { $sum: '$amount' },
            },
            },
            {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                total: 1,
            },
            },
            { $sort: { year: 1, month: 1 } },
        ])
        .exec();

        const trend: { month: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const monthNum = d.getMonth() + 1;
            const label = d.toLocaleString('en-US', { month: 'long' });

            const entry = raw.find(r => r.year === year && r.month === monthNum);
            trend.push({
                month: label,
                amount: entry ? entry.total : 0,
            });
        }

        return trend;
    }
}
