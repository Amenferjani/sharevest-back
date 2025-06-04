import { Controller, Post, Delete, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DealService } from '../services/deal.service';
import { DealDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('private-vest/deal')
@UseGuards(JwtAuthGuard)
export class DealController {
    constructor(private readonly dealService: DealService) {}

    @Post()
    async createDeal(@Body() dealDto: DealDto , @Req() req) {
        return this.dealService.createDeal(dealDto, req.user);
    }

    @Patch(':id')
    async updateDeal(@Param('id') id: string, @Body()  dealDto: DealDto , @Req() req) {
        return this.dealService.updateDeal(id, dealDto, req.user);
    }

    @Delete(':id')
    async deleteDeal(@Param('id') id: string, @Req() req) {
        return this.dealService.deleteDeal(id, req.user);
    }

    @Get()
    async getDealList(@Req() req, @Body()  filters?: any ) {
        return this.dealService.getDealList(filters, req.user);
    }

    @Get(':id')
    async getDealDetails(@Param('id') id: string, @Req() req) {
        return this.dealService.getDealDetails(id, req.user);
    }

    @Get('top/deals')
    async getTopDeals(@Req() req, @Body()   filters?: any ) {
        return this.dealService.getTopDeals(filters, req.user);
    }
}
