import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoleEnum, Roles, RolesGuard, Update } from '@amenferjani/shared-lib';
import { CampaignOwnerGuard } from 'src/guards/campaign-owner.guard';
import { ContributorGuard } from 'src/guards/contributor.guard';
import { UpdateService } from 'src/services/update.service';

@Controller()
export class UpdateController {
    constructor(private readonly updateService: UpdateService) {}

    @MessagePattern({ cmd: 'get_updates_by_campaign' })
    @Roles(RoleEnum.ADMIN, RoleEnum.USER) 
    @UseGuards(RolesGuard)
    async getUpdatesByCampaign(
        @Payload() payload: {
                    id: string,
                    user: {
                        userId: string;
                        email: string;
                        roles: { id: string; name: string }[];
                    }
                }
    ): Promise<Update[]> {
        const { id } = payload;
        console.log(id)
        return this.updateService.getUpdatesByCampaign(id);
    }

    @MessagePattern({ cmd: 'delete_update' })
    @Roles(RoleEnum.ADMIN, RoleEnum.CAMPAIGN_MANAGER)
    @UseGuards(CampaignOwnerGuard)
    async deleteUpdate(
        @Payload() payload: {
                    id: string,
                    updateId:string,
                    user: {
                        userId: string;
                        email: string;
                        roles: { id: string; name: string }[];
                    }
                }
    ): Promise<void> {
        const { updateId} = payload;
        await this.updateService.deleteUpdate(updateId);
    }

    @MessagePattern({ cmd: 'create_update' })
    @Roles(RoleEnum.ADMIN, RoleEnum.CAMPAIGN_MANAGER)
    @UseGuards(CampaignOwnerGuard)
    async CreateUpdate(
        @Payload() payload: {
                    message: string,
                    id: string,
                    user: {
                        userId: string;
                        email: string;
                        roles: { id: string; name: string }[];
                    }
                }
    ): Promise<Update> {
        const { id, message } = payload;
        console.log(id)
        return this.updateService.addUpdate({campaignId: id, message : message});
    }
}
