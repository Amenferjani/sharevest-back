import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { ROLES_KEY } from '@amenferjani/shared-lib';

@Injectable()
export class CampaignOwnerGuard implements CanActivate {
    constructor(private readonly campaignService: CampaignService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredRoles: string[] = Reflect.getMetadata(ROLES_KEY, context.getHandler());
        if (!requiredRoles) return true;
        
        const payload = context.switchToRpc().getData();
        const user = payload.user; 
        const campaignId = payload.id 

        if (payload?.service) {
            return requiredRoles.includes(payload.service.name); 
        }

        if (!campaignId) {
            throw new ForbiddenException('Campaign ID is required');
        }
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
        const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role.name));
        if (!hasRequiredRole) {
            throw new ForbiddenException('You do not have the required role to access this resource');
        }

        const campaign = await this.campaignService.getCampaignById(campaignId);
        if (!campaign) {
            throw new ForbiddenException('Campaign not found');
        }

        if (user.userId === campaign.creatorId) {
            return true; 
        }

        throw new ForbiddenException('You do not have permission to access this campaign');
    }
}