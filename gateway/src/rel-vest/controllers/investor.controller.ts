import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { InvestorService } from '../services/investor.service';
import { InvestorDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('rel-vest/investors')
export class InvestorController {
    constructor(private readonly investorService: InvestorService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async addInvestor(@Req() req ,@Body() investorDto: InvestorDto) {
        const user = req.user;
        return this.investorService.addInvestor(investorDto, user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateInvestor(@Req() req ,@Param('id') id: string, @Body() investorDto: InvestorDto) {
        const user = req.user;
        return this.investorService.updateInvestor(id, investorDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async removeInvestor(@Req() req ,@Param('id') id: string) {
        const user = req.user;
        return this.investorService.removeInvestor(id, user);
    }

    @Get('company/:companyId')
    @UseGuards(JwtAuthGuard)
    async getInvestorsByCompany(@Req() req, @Param('companyId') companyId: string) {
        const user = req.user;
        return this.investorService.getInvestorsByCompany(companyId, user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getInvestors(@Req() req ,@Body() filters: any) {
        const user = req.user;
        return this.investorService.getInvestors(filters, user);
    }

    @Get('/byId')
    @UseGuards(JwtAuthGuard)
    async getInvestorById(@Req() req) {
        console.log("http investor by id ")
        const user = req.user;
        return this.investorService.getInvestorById( user);
    }

    @Post('/link/:companyId')
    @UseGuards(JwtAuthGuard)
    async linkInvestorToCompany(@Req() req , @Param('companyId') companyId: string) {
        const user = req.user;
        return this.investorService.linkInvestorToCompany(companyId, user);
    }

    @Delete('/unlink/:companyId')
    @UseGuards(JwtAuthGuard)
    async unlinkInvestorFromCompany(@Req() req, @Param('companyId') companyId: string) {
        const user = req.user;
        return this.investorService.unlinkInvestorFromCompany(companyId, user);
    }

}
