import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { InvestmentService } from '../services/investment.service';
import { InvestmentDto, JwtAuthGuard } from '@amenferjani/shared-lib';
import { ApiOperation } from '@nestjs/swagger';

@Controller('hedge-funds/investments')
export class InvestmentController {
    constructor(
        private readonly investmentService: InvestmentService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create an investment' })
    @UseGuards(JwtAuthGuard)
    async createInvestment(@Body() investmentDto: InvestmentDto, @Req() req) {
        return this.investmentService.createInvestment(investmentDto, req.user);
    }

    @Get("all")
    @ApiOperation({ summary: 'Get all investments (Admin only)' })
    @UseGuards(JwtAuthGuard)
    async getAllInvestments(@Req() req) {
        console.log("gateway controller")
        return this.investmentService.getAllInvestments(req.user);
    }

    @Get('investor/:id')
    @ApiOperation({ summary: 'Get investments by investor ID' })
    @UseGuards(JwtAuthGuard)
    async getInvestmentsByInvestor(@Param('id') investorId: string, @Req() req) {
        return this.investmentService.getInvestmentsByInvestor(investorId, req.user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an investment' })
    @UseGuards(JwtAuthGuard)
    async updateInvestment(@Param('id') id: string, @Body() investmentDto: InvestmentDto, @Req() req) {
        return this.investmentService.updateInvestment(id, investmentDto, req.user);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update investment status' })
    @UseGuards(JwtAuthGuard)
    async updateInvestmentStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req) {
        return this.investmentService.updateInvestmentStatus(id, body.status, req.user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an investment' })
    @UseGuards(JwtAuthGuard)
    async deleteInvestment(@Param('id') id: string, @Req() req) {
        return this.investmentService.deleteInvestment(id, req.user);
    }
}
