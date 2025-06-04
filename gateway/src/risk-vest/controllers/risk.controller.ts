import { Controller, Post, Body, Get, Param, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard, RiskProfileDto } from '@amenferjani/shared-lib';
import { RiskService } from '../services/risk.service';

@Controller('risk-vest')
@UseGuards(JwtAuthGuard)
export class RiskController {
    constructor(private readonly riskService: RiskService) {}

    @Post()
    async createRiskProfile(@Body() riskDto: RiskProfileDto , @Req() req) {
        const user = req.user;
        return this.riskService.createRiskProfile(riskDto ,user);
    }

    @Get('findAll')
    async findAllRiskProfiles(@Req() req) {
        const user = req.user;
        return this.riskService.findAllRiskProfiles(user);
    }

    @Get('find/:id')
    async findRiskProfileById(@Param('id') id: string, @Req() req) {
        const user = req.user;
        return this.riskService.findRiskProfileById(id,user);
    }

    @Delete('delete/:id')
    async deleteRiskProfile(@Param('id') id: string, @Req() req) {
        const user = req.user;
        return this.riskService.deleteRiskProfile(id, user);
    }

    @Get('user')
    async getUserRiskProfile(@Req() req) {
        const user = req.user;
        return this.riskService.getUserRiskProfile(user);
    }

    @Patch('update')
    async updateRiskProfile(@Body() updatedRiskProfileDto: RiskProfileDto , @Req() req) {
        const user = req.user;
        return this.riskService.updateRiskProfileByUserId(updatedRiskProfileDto , user);
    }

    @Get('suggest')
    async suggestRiskProfileChange( @Req() req) {
        const user = req.user;
        return this.riskService.suggestRiskProfileChange(user);
    }

    @Get('aggregated')
    async getAggregatedRiskDetails(  @Req() req) {
        const user = req.user;
        return this.riskService.getAggregatedRiskDetails(user);
    }

    @Get('crowdfunding')
    async getAdjustedCrowdfundingRiskForUser(@Req() req) {
        const user = req.user;
        return this.riskService.getAdjustedCrowdfundingRiskForUser( user);
    }
}