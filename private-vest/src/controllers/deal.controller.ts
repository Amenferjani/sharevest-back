import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DealService } from '../services/deal.service';
import { DealDto, Deal, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';

@Controller()
export class DealController {
    constructor(
        private readonly dealService: DealService,
    ) { }

    @MessagePattern({ cmd: 'create-deal' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async createDeal(@Payload() payload: {
        dealDto: DealDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<Deal> {
        return this.dealService.createDeal(payload.dealDto);
    }

    @MessagePattern({ cmd: 'update-deal' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async updateDeal(@Payload() payload: {
        id: string,
        dealDto: DealDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<Deal> {
        return this.dealService.updateDeal(payload.id, payload.dealDto);
    }

    @MessagePattern({ cmd: 'delete-deal' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async deleteDeal(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<void> {
        return this.dealService.deleteDeal(payload.id);
    }

    @MessagePattern({ cmd: 'get-deal-list' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getDealList(@Payload() payload: {
        filters?: any,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<Deal[]> {
        return this.dealService.getDealList(payload.filters);
    }

    @MessagePattern({ cmd: 'get-deal-details' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getDealDetails(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<Deal> {
        return this.dealService.getDealDetails(payload.id);
    }

    @MessagePattern({ cmd: 'get-top-deals' })
    @Roles(RoleEnum.PRIVATE_MANAGER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getTopDeals(@Payload() payload: {
        filters?: any,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }): Promise<Deal[]> {
        return this.dealService.getTopDeals(payload.filters);
    }
}
