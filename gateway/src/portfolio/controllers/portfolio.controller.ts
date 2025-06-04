import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PortfolioDto, Portfolio } from '@amenferjani/shared-lib';
import { PortfolioService } from '../services/portfolio.service';

@Controller('portfolio')
export class PortfolioController {
    constructor(
        private readonly portfolioService: PortfolioService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPortfolio(@Body() portfolioDto: PortfolioDto, @Req() req): Promise<Portfolio> {
        
        return await this.portfolioService.createPortfolio(
            {
                ...portfolioDto,
                userId: req.user.userId
            },
            req.user
        );
    }

    @Get(':id/risk')
    async getPortfolioDetails(@Param('id') id: string): Promise<any> {
        return await this.portfolioService.getPortfolioDetails(id);
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async getPortfoliosByUser(@Req() req): Promise<Portfolio[]> {

        return await this.portfolioService.getPortfoliosByUser(req.user);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getPortfolioById(@Param('id') id: string,@Req() req): Promise<Portfolio> {
        return await this.portfolioService.getPortfolioById(id,req.user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updatePortfolio(@Param('id') id: string, @Body() portfolioDto: PortfolioDto): Promise<Portfolio> {
        return await this.portfolioService.updatePortfolio(id, portfolioDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deletePortfolio(@Param('id') id: string): Promise<void> {
        return await this.portfolioService.deletePortfolio(id);
    }
}
