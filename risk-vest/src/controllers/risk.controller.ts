import { Controller, Post, Get, Param, Body, Delete, Patch, UseGuards } from '@nestjs/common';
import { RiskProfileService } from '../services/risk.service'; 
import { RiskProfileDto } from '@amenferjani/shared-lib';
import { RiskProfile } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class RiskController {
    constructor(private readonly riskService: RiskProfileService) {}

    @MessagePattern('create_risk_profile')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async createRiskProfile(@Payload() payload: { riskDto: RiskProfileDto, user: { userId: string, email: string, roles: { id: string, name: string } } }) : Promise<RiskProfile>{
        return this.riskService.create({ 
            ...payload.riskDto, 
            userId: payload.user.userId 
        });
    }

    @MessagePattern('find-all-risk-profiles')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async findAll(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<RiskProfile[]> {
        return this.riskService.findAll();
    }

    @MessagePattern('find-risk-profile-by-id')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async findById(@Payload() payload: { id: string, user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<RiskProfile> {
        return this.riskService.findById(payload.id);
    }

    @MessagePattern('delete-risk-profile')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async delete(@Payload() payload: { id: string, user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<RiskProfile> {
        return this.riskService.delete(payload.id);
    }

    @MessagePattern('get-user-risk-profile')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getUserRiskProfile(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }) : Promise<RiskProfile>{
        return this.riskService.getRiskProfile(payload.user.userId);
    }

    @MessagePattern('update-risk-profile-by-user-id')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async updateRiskProfile(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } }, updatedRiskProfileDto: RiskProfileDto }): Promise<RiskProfile> {
        return this.riskService.updateRiskProfile( payload.user.userId,payload.updatedRiskProfileDto);
    }

    @MessagePattern('suggest-risk-profile-change')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async suggestRiskProfileChange(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<string> {
        return this.riskService.suggestRiskProfileChange(payload.user.userId,);
    }

    @MessagePattern('get-aggregated-risk-details')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getAggregatedRiskDetails(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } }}): Promise<any> {
        return this.riskService.getAggregatedRiskDetails(payload.user.userId);
    }

    @MessagePattern('get-adjusted-crowdfunding-risk-for-user')
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getAdjustedCrowdfundingRiskForUser(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<any> {
        return this.riskService.getAdjustedCrowdfundingRiskForUser( payload.user.userId);
    }
}