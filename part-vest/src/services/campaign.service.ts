import { Inject, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Campaign, RoleEnum, Update } from '@amenferjani/shared-lib'; 
import { CampaignDto } from '@amenferjani/shared-lib';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CampaignService {
    constructor(
        @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
        ) {}

    async createCampaign(campaignDto: CampaignDto): Promise<Campaign> {
        console.log("creating campaign in tcp service")
        const campaign = new this.campaignModel(campaignDto);
        
        const updatedUser = await this.addCampaignOwnerRoleToUser(campaignDto.creatorId);
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        const savedCampaign = campaign.save();
        return savedCampaign;
    }

    async getCampaigns(): Promise<Campaign[]> {
        return this.campaignModel.find().exec();
    }

    async getCampaignById(id: string): Promise<Campaign> {
        console.log("tcp campaign service /get campaign by id :", id)

        const campaign = await this.campaignModel.findById(id).populate('updates').exec();
        if (!campaign) throw new NotFoundException('Campaign not found');
        return campaign;
    }

    // async updateCampaign(id: string, campaignDto: CampaignDto, updateId: Types.ObjectId): Promise<Campaign> {
    //     const updatedCampaign = await this.campaignModel.findByIdAndUpdate(
    //         id,
    //         {
    //             ...campaignDto, 
    //             $push: { updates: updateId },
    //         },
    //         { new: true }
    //     ).exec();

    //     if (!updatedCampaign) {
    //         throw new NotFoundException('Campaign not found');
    //     }

    //     return updatedCampaign;
    // }

    async updateCampaign(id: string, campaignDto:Partial<CampaignDto> ): Promise<Campaign> {
        const updatedCampaign = await this.campaignModel
            .findByIdAndUpdate(
                id as unknown as ObjectId,
                { $set: campaignDto },
                { new: true, runValidators: true }
            )
            .exec();

        if (!updatedCampaign) {
            throw new NotFoundException('Campaign not found');
        }

        return updatedCampaign;
    }

    async getCampaignsByOwner(creatorId: string): Promise<Campaign[]>{
        return this.campaignModel.find({creatorId}).exec()
    }

    async deleteCampaign(id: string): Promise<void> {
        const result = await this.campaignModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Campaign not found');
    }

    async addUpdateToCampaign(id: string, updateId: Types.ObjectId) {
        const campaign = await this.campaignModel.findById(id).populate('updates').exec();
        if (!campaign) throw new NotFoundException('Campaign not found');
        campaign.updates.push(updateId );
        return await campaign.save();
    }

    async getRecentCampaigns(page = 1, limit = 6): Promise<Campaign[]> {
        console.log("tcp campaign service /get recent campaigns :", page, limit)
        const skip = (page - 1) * limit;
        return this.campaignModel
            .find()
            .sort({ startDate: -1 }) 
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async getCampaignsByUiFilters(data:{
        category?: string,
        progressRange?: string,
        daysLeftRange?: string,
        limit ?:number | 10
    }): Promise<Campaign[]> {
        const filter: Record<string, any> = {};
        const now = new Date();
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const { category, progressRange, daysLeftRange , limit} = data;

        if (category) {
        filter.category = category;
        }

        if (progressRange) {
        let progFilter: Record<string, number> = {};
        if (progressRange.startsWith('<')) {
            const max = parseFloat(progressRange.slice(1));
            progFilter.$lt = max;
        } else if (progressRange.startsWith('>')) {
            const min = parseFloat(progressRange.slice(1));
            progFilter.$gt = min;
        } else if (progressRange.includes('-')) {
            const [min, max] = progressRange.split('-').map(n => parseFloat(n));
            progFilter.$gte = min;
            progFilter.$lte = max;
        }
        if (Object.keys(progFilter).length) {
            filter.fundingProgress = progFilter;
        }
        }

        if (daysLeftRange) {
        let dateFilter: Record<string, Date> = {};
        const parseOffset = (n: number) =>
            new Date(now.getTime() + n * MS_PER_DAY);

        if (daysLeftRange.startsWith('<')) {
            const maxDays = parseFloat(daysLeftRange.slice(1));
            dateFilter.$lte = parseOffset(maxDays);
        } else if (daysLeftRange.startsWith('>')) {
            const minDays = parseFloat(daysLeftRange.slice(1));
            dateFilter.$gte = parseOffset(minDays);
        } else if (daysLeftRange.includes('-')) {
            const [minDays, maxDays] = daysLeftRange
            .split('-')
            .map(n => parseFloat(n));
            dateFilter.$gte = parseOffset(minDays);
            dateFilter.$lte = parseOffset(maxDays);
        }
        if (Object.keys(dateFilter).length) {
            filter.endDate = dateFilter;
        }
        }

        console.log(filter)
        return this.campaignModel
        .find(filter)
        .limit(limit)
        .exec();
    }


    protected async addCampaignOwnerRoleToUser(userId: string) {
        const roleName = RoleEnum.CAMPAIGN_MANAGER;
        console.log("call adding campaign owner role from tcp service")
        return await this.userClient.send({ cmd: 'add_role_to_user' }, {id : userId,roleName:roleName,service : {name :RoleEnum.RISK_SERVICE}}).toPromise();
    }
}
