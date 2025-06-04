import { Controller, NotFoundException, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvestorTrackingService } from '../services/investor-tracking.service';
import { InvestorTrackingDto } from '@amenferjani/shared-lib';
import { InvestorTracking } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';

@Controller()
export class InvestorTrackingController {
    constructor(
        private readonly investorTrackingService: InvestorTrackingService,
    ) {}

    @MessagePattern({ cmd: 'add-investor' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async addInvestor(@Payload() payload: {
        investorTrackingDto: InvestorTrackingDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<InvestorTracking> {
        return this.investorTrackingService.addInvestor(payload.investorTrackingDto);
    }

    @MessagePattern({ cmd: 'update-investor' })
    @Roles(RoleEnum.PRIVATE_INVESTOR,RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async updateInvestor(@Payload() payload: {
        id: string,
        investorTrackingDto: InvestorTrackingDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<InvestorTracking> {
        return this.investorTrackingService.updateInvestor(payload.id, payload.investorTrackingDto);
    }

    @MessagePattern({ cmd: 'remove-investor' })
    @Roles(RoleEnum.PRIVATE_INVESTOR,RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async removeInvestor(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<void> {
        return this.investorTrackingService.removeInvestor(payload.id);
    }

    @MessagePattern({ cmd: 'get-investments-by-investor' })
    @Roles(RoleEnum.PRIVATE_INVESTOR,RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getInvestmentsByInvestor(@Payload() payload: {
        investorId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<InvestorTracking[]> {
        const investments = await this.investorTrackingService.getInvestmentsByInvestor(payload.investorId);
        if (investments.length === 0) {
            throw new NotFoundException(`No investments found for investor with ID: ${payload.investorId}`);
        }
        return investments;
    }

    @MessagePattern({ cmd: 'get-investors-by-deal' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getInvestorsByDeal(@Payload() payload: {
        dealId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<InvestorTracking[]> {
        const investors = await this.investorTrackingService.getInvestorsByDeal(payload.dealId);
        if (investors.length === 0) {
            throw new NotFoundException(`No investors found for deal with ID: ${payload.dealId}`);
        }
        return investors;
    }
}
