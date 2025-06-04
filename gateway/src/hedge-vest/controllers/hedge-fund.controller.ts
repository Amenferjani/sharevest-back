import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { HedgeFundService } from '../services/hedge-fund.service';
import { HedgeFund, HedgeFundDto, JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('hedge-funds')
@UseGuards(JwtAuthGuard)
export class HedgeFundController {
    constructor(private readonly hedgeFundService: HedgeFundService) {}

    @Post()
    async createHedgeFund(@Body() hedgeFundDto: HedgeFundDto, @Req() req) : Promise<HedgeFund>{
        return this.hedgeFundService.createHedgeFund(hedgeFundDto, req.user);
    }

    @Get()
    async getHedgeFunds(@Req() req) {
        return this.hedgeFundService.getHedgeFunds(req.user);
    }

    @Get(':id')
    async getHedgeFundById(@Param('id') id: string, @Req() req) {
        return this.hedgeFundService.getHedgeFundById(id, req.user);
    }

    @Patch(':id')
    async updateHedgeFund(@Param('id') id: string, @Body() hedgeFundDto: HedgeFundDto, @Req() req) {
        return this.hedgeFundService.updateHedgeFund(id, req.user, hedgeFundDto);
    }

    @Delete(':id')
    async deleteHedgeFund(@Param('id') id: string, @Req() req) {
        return this.hedgeFundService.deleteHedgeFund(id, req.user);
    }

    @Get(':id/details')
    async getHedgeFundDetails(@Param('id') id: string, @Req() req) {
        return this.hedgeFundService.getHedgeFundDetails(id, req.user);
    }
}
