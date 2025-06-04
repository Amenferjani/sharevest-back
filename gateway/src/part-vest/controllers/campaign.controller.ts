import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    Patch,
    Query,
    } from '@nestjs/common';
import { Campaign, CampaignDto, Update, UpdateDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib'; 
import { CampaignService } from '../services/campaign.service';

@Controller('part-vest/campaign')
@UseGuards(JwtAuthGuard)
export class CampaignController {
    constructor(private readonly campaignService: CampaignService) {}

    @Post()
    async createCampaign(@Body() campaignDto: CampaignDto, @Req() req) {
        const user = req.user; 
        campaignDto.creatorId = user.userId;
        return this.campaignService.createCampaign( user, campaignDto );
    }

    @Get()
    async getCampaigns(@Req() req) {
        const user = req.user;
        return this.campaignService.getCampaigns({ user });
    }

    @Get(':id')
    async getCampaignById(@Param('id') id: string, @Req() req) {
        const user = req.user; 
        return this.campaignService.getCampaignById({ user, id });
    }

    @Patch(':id')
    async updateCampaign(
    @Param('id') id: string,
    @Body('campaign') campaignDto: Partial<CampaignDto>,
    @Req() req
    ): Promise<{ campaign: Campaign }> {
        const user = req.user;
        const updated = await this.campaignService.updateCampaign(user, id, campaignDto);
        return updated ;
    }

    @Delete(':id')
    async deleteCampaign(@Param('id') id: string, @Req() req) {
        const user = req.user;
        return this.campaignService.deleteCampaign({ user, id });
    }

    @Get('owner/by-id')
    async getCampaignsByOwner(@Req() req) {
        const user = req.user; 
        return this.campaignService.getCampaignsByOwner(user);
    }

    @Get('get/recent')
    async getRecentCampaigns(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.campaignService.getRecentCampaigns({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 6,
        });
    }

    @Get('get/by-filter')
    async getCampaignsByFilter(
        @Query('category') category?: string,
        @Query('progressRange') progressRange?: string,
        @Query('daysLeftRange') daysLeftRange?: string,
        @Query('limit') limit?: string,
    ) {
        return this.campaignService.getCampaignsByUiFilters({category,progressRange,daysLeftRange,limit:parseInt(limit)});
    }
}