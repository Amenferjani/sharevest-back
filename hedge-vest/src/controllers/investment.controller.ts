import { Controller, UseGuards } from '@nestjs/common';
import {  MessagePattern, Payload } from '@nestjs/microservices';
import { InvestmentService } from '../services/investment.service';
import { Investment, InvestmentDto } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';

@Controller()
export class InvestmentController {
    constructor(private readonly investmentService: InvestmentService) {}

    @MessagePattern({cmd:'create-investment'})
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async createInvestment(@Payload() payload: {
        investmentDto: InvestmentDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { investmentDto } = payload; 
        return this.investmentService.createInvestment(investmentDto);
    }

    @MessagePattern({cmd:'get-all-investments'})
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getAllInvestments(@Payload() payload: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) : Promise<Investment[]>{
        return this.investmentService.getAllInvestments();
    }

    @MessagePattern({cmd :'get-investments-by-investor'})
    @Roles( RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getInvestmentsByInvestor(@Payload() payload: {
        investorId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { investorId } = payload;
        return this.investmentService.getInvestmentsByInvestor(investorId);
    }

    @MessagePattern({cmd :'update-investment'})
    @Roles(RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async updateInvestment(
        @Payload() payload: {
            id: string,
            investmentDto: InvestmentDto,
            user: { userId: string, email: string, roles: { id: string, name: string } },
        },
    ) {
        return this.investmentService.updateInvestment(payload.id, payload.investmentDto);
    }

    @MessagePattern({cmd:'update-investment-status'})
    @Roles(RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async updateInvestmentStatus(
        @Payload() payload: {
            id: string,
            status: string,
            user: { userId: string, email: string, roles: { id: string, name: string } },
        },
    ) {
        return this.investmentService.updateInvestmentStatus(payload.id, payload.status);
    }

    @MessagePattern({cmd:'delete-investment'})
    @Roles(RoleEnum.HEDGE_INVESTOR, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async deleteInvestment(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { id } = payload;
        return this.investmentService.deleteInvestment(id);
    }
}
