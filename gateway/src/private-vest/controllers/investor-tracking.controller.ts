import { Controller, Post, Body, Param, Delete, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '@amenferjani/shared-lib';
import { InvestorTrackingDto } from '@amenferjani/shared-lib';
import { InvestorTrackingService } from '../services/investor-tracking.service';

@Controller('private-vest/investor-tracking')
@UseGuards(JwtAuthGuard)
export class InvestorTrackingController {
    constructor(
        private readonly investorTrackingService: InvestorTrackingService
    ) { }

    @Post()
    async addInvestor(
        @Body() investorTrackingDto: InvestorTrackingDto,
        @Req() req,
    ) {
        const user = req.user;
        return this.investorTrackingService.addInvestor(investorTrackingDto, user);
    }

    @Patch(':id')
    async updateInvestor(
        @Param('id') id: string,
        @Body() investorTrackingDto: InvestorTrackingDto,
        @Req() req,
    ) {
        const user = req.user;
        return this.investorTrackingService.updateInvestor(id, investorTrackingDto, user);
    }

    @Delete(':id')
    async removeInvestor(
        @Param('id') id: string,
        @Req() req,
    ) {
        const user = req.user;
        return this.investorTrackingService.removeInvestor(id, user);
    }

    @Get('investments/:investorId')
    async getInvestmentsByInvestor(
        @Param('investorId') investorId: string,
        @Req() req,
    ) {
        const user = req.user;
        return this.investorTrackingService.getInvestmentsByInvestor(investorId, user);
    }

    @Get('investors/:dealId')
    async getInvestorsByDeal(
        @Param('dealId') dealId: string,
        @Req() req,
    ) {
        const user = req.user;
        return this.investorTrackingService.getInvestorsByDeal(dealId, user);
    }
}
