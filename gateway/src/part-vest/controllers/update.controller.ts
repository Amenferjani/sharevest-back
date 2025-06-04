import {
    Controller,
    Get,
    Delete,
    Param,
    Req,
    UseGuards,
    Body,
    Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '@amenferjani/shared-lib';
import { Update } from '@amenferjani/shared-lib';
import { UpdateService } from '../services/update.service';

@Controller('part-vest/updates')
@UseGuards(JwtAuthGuard)
export class UpdateController {
    constructor(private readonly updateService: UpdateService) {}

    @Get('campaign/:id')
    async getUpdatesByCampaign(@Param('id') id: string, @Req() req): Promise<Update[]> {
        const user = req.user; 
        return this.updateService.getUpdatesByCampaign(id, user);
    }

    @Post()
    async createUpdate(@Body() body: {
        campaignId: string,
        message: string,
    }, @Req() req): Promise<Update>{
        const user = req.user;
        const { campaignId, message } = body;
        return this.updateService.createUpdate(campaignId, message, user);
    }

    @Delete(':id/campaign/:campaignId')
    async deleteUpdate(@Param('id') updateId: string,@Param('campaignId')campaignId : string, @Req() req): Promise<void> {
        const user = req.user;
        await this.updateService.deleteUpdate(campaignId, updateId, user);
    }
}