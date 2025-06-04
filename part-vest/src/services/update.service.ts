import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Campaign, Update } from '@amenferjani/shared-lib';
import { UpdateDto } from '@amenferjani/shared-lib';
import { CampaignService } from './campaign.service';
import { throws } from 'assert';

@Injectable()
export class UpdateService {
    constructor(
        @InjectModel(Update.name) private updateModel: Model<Update>,
        private readonly campaignService: CampaignService,
    ) {}

    async addUpdate(updateDto: UpdateDto): Promise<Update> {
        
        const campaignObjectId = updateDto.campaignId as unknown as Types.ObjectId;

        // Create the update
        const update = new this.updateModel({ ...updateDto, campaignId: campaignObjectId });
        const savedUpdate = await update.save();
        const campaign = this.campaignService.addUpdateToCampaign(updateDto.campaignId, savedUpdate._id as Types.ObjectId)
        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }
        return savedUpdate ;
    }


    async getUpdatesByCampaign(campaignId: string): Promise<Update[]> {
        const id = campaignId as unknown as Types.ObjectId;
        console.log("update tcp service : ",id)
        return this.updateModel.find({ campaignId: id }).sort({ date: -1 }).exec();
    }

    async deleteUpdate(id: string): Promise<void> {
        const result = await this.updateModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Update not found');
    }
}
