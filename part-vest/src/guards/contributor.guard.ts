import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { ROLES_KEY } from '@amenferjani/shared-lib';
import { ContributionService } from 'src/services/contribution.service';

@Injectable()
export class ContributorGuard implements CanActivate {
    constructor(
        private readonly campaignService: CampaignService,
        private readonly contributorService: ContributionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles: string[] = Reflect.getMetadata(ROLES_KEY, context.getHandler());
        if (!requiredRoles) return true;

        const payload = context.switchToRpc().getData();
        const user = payload.user;
        const campaignId = payload.id;

        if (!campaignId) {
            throw new ForbiddenException('Campaign ID is required');
        }

        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
        const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role.name));
        if (!hasRequiredRole) {
            throw new ForbiddenException('You do not have the required role to access this resource');
        }

        if (userRoles.some(role => role.name === 'admin' )) {
            return true;
        }

        const campaign = await this.campaignService.getCampaignById(campaignId);
        if (!campaign) {
            throw new ForbiddenException('Campaign not found');
        }

        if (userRoles.some(role => role.name === 'campaign_manager') && user.userId === campaign.creatorId) {
            return true;
        }

        if (userRoles.some(role => role.name === 'campaign_contributor')) {
            const contributions = await this.contributorService.getContributionsByCampaign(campaignId);
            const hasContributed = contributions.some(contribution => contribution.userId === user.userId);
            if (hasContributed) {
                return true;
            }
        }

        throw new ForbiddenException('You do not have permission to access this campaign');
    }
}