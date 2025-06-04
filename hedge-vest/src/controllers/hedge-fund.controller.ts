import { Controller, UseGuards  } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HedgeFundService } from '../services/hedge-fund.service';
import { HedgeFundDto } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';

@Controller()
export class HedgeFundController {
    constructor(private readonly hedgeFundService: HedgeFundService) {}

    @MessagePattern('create-hedge-fund')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async createHedgeFund(@Payload() payload: {
        hedgeFundDto: HedgeFundDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { hedgeFundDto } = payload;
        return this.hedgeFundService.createHedgeFund(hedgeFundDto);
    }

    @MessagePattern('get-hedge-funds')
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards(RolesGuard)
    async getHedgeFunds(
        @Payload() payload: {
            user: { userId: string, email: string, roles: { id: string, name: string } },
        }
    ) {
        return this.hedgeFundService.getHedgeFunds();
    }

    @MessagePattern('get-hedge-fund-by-id')
    @Roles(RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards(RolesGuard)
    async getHedgeFundById(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { id } = payload;
        return this.hedgeFundService.getHedgeFundById(id);
    }

    @MessagePattern('update-hedge-fund')
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards(RolesGuard)
    async updateHedgeFund(
        @Payload() payload: {
            id: string,
            hedgeFundDto: HedgeFundDto,
            user: { userId: string, email: string, roles: { id: string, name: string } },
        },
    ) {
        const { id, hedgeFundDto } = payload;
        return this.hedgeFundService.updateHedgeFund(id, hedgeFundDto);
    }

    @MessagePattern('delete-hedge-fund')
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards(RolesGuard)
    async deleteHedgeFund(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { id } = payload;
        return this.hedgeFundService.deleteHedgeFund(id);
    }

    @MessagePattern('get-hedge-fund-details')
    @Roles(RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards(RolesGuard)
    async getHedgeFundDetails(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { id } = payload;
        return this.hedgeFundService.getHedgeFundDetails(id);
    }
}
