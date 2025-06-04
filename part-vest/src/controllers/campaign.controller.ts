import {
    Controller,
    UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CampaignDto, RolesGuard, Update, UpdateDto } from '@amenferjani/shared-lib';
import { CampaignService } from 'src/services/campaign.service';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib'; 
import { CampaignOwnerGuard } from 'src/guards/campaign-owner.guard';
import { UpdateService } from 'src/services/update.service';
import {  Types } from 'mongoose';


type User = {
    userId: string;
    email: string;
    roles: { id: string; name: string }[];
};

@Controller()
export class CampaignController {
    constructor(private readonly campaignService: CampaignService,
        private readonly updateService: UpdateService
    ) { }

    @MessagePattern({ cmd: 'create_campaign' })
    @Roles(RoleEnum.ADMIN, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async createCampaign(
        @Payload() payload: { user: User; campaignDto: CampaignDto },
    ) {
        const { user, campaignDto } = payload;
            console.log(user,campaignDto)
        return this.campaignService.createCampaign( campaignDto );
    }

    @MessagePattern({ cmd: 'get_campaigns' })
    @Roles(RoleEnum.ADMIN) 
    @UseGuards(RolesGuard) 
    async getCampaigns(@Payload() payload: { user: User }) {
        const { user } = payload;
        return this.campaignService.getCampaigns();
    }

    @MessagePattern({ cmd: 'get_campaign_by_id' })
    @Roles(RoleEnum.USER, RoleEnum.RISK_SERVICE)
    @UseGuards(RolesGuard)
    async getCampaignById(
        @Payload() payload: { user: User; id: string },
    ) {
        console.log("tcp campaign controller /get campaign by id :",payload)
        const { user, id } = payload;
        return this.campaignService.getCampaignById( id );
    }

    @MessagePattern({ cmd: 'update_campaign' })
    @Roles(RoleEnum.ADMIN, RoleEnum.CAMPAIGN_MANAGER) 
    @UseGuards(CampaignOwnerGuard) 
    async updateCampaign(
        @Payload() payload: { id: string; user: User; campaignDto: Partial<CampaignDto>},
    ) {
        const { id, campaignDto } = payload;
        const updatedCampaign = await this.campaignService.updateCampaign(id, campaignDto );
        return { updatedCampaign};
    }

    @MessagePattern({ cmd: 'delete_campaign' })
    @Roles(RoleEnum.ADMIN) 
    @UseGuards(CampaignOwnerGuard) 
    async deleteCampaign(
        @Payload() payload: { user: User; id: string },
    ) {
        const { user, id } = payload;
        await this.campaignService.deleteCampaign( id );
        return { message: 'Campaign deleted successfully' };
    }

    @MessagePattern({ cmd: "get_campaigns_by_owner" })
    @Roles(RoleEnum.ADMIN, RoleEnum.CAMPAIGN_MANAGER)
    @UseGuards(RolesGuard)
    async getCampaignsByOwner(
        @Payload() payload: { user: User; },
    ) {
        const { user } = payload;
        return this.campaignService.getCampaignsByOwner(user.userId);
    }

    @MessagePattern({ cmd: 'get_recent_campaigns' })
    async getRecentCampaigns(
        @Payload() payload: { page: number; limit: number },
    ){
        const { page, limit } = payload;
        return this.campaignService.getRecentCampaigns(page, limit);
    }

    @MessagePattern({ cmd: 'get_campaigns_by_ui_filters' })
    async getCampaignsByUiFilters(
        @Payload() payload: {
            category?: string,
            progressRange?: string,
            daysLeftRange?: string,
            limit?: number
        }
    ) {
        return this.campaignService.getCampaignsByUiFilters(payload);
    }
}