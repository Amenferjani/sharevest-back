import { Controller, UseGuards } from '@nestjs/common';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioDto } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssetService } from 'src/services/asset.service';
import { TransactionService } from 'src/services/transaction.service';

@Controller('portfolio')
export class PortfolioController {
    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly transactionService: TransactionService,
        private readonly assetService: AssetService,
    ) { }

    @MessagePattern({ cmd: 'check_health' })
    checkHealth(): string {
        return 'Health check passed';
    }

    @MessagePattern({ cmd: 'create_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards( RolesGuard) 
    async createPortfolio(@Payload() payload: { portfolioDto: PortfolioDto, user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<any> {
        const { portfolioDto ,user } = payload;
        console.log(portfolioDto);
        return await this.portfolioService.createPortfolio(portfolioDto);
    }

    @MessagePattern({ cmd: 'get_portfolio_details' })
    async getPortfolioDetails(@Payload() data: { userId: string }): Promise<any> {
        const portfolio = await this.portfolioService.getPortfoliosByUser(data.userId);
        const investmentStrategy = await this.portfolioService.getInvestmentStrategy(portfolio.investmentStrategy);
        const assetsRisk = await this.assetService.calculateAssetRisks(portfolio.id);
        const transactionsRisk = await this.transactionService.calculateTransactionRisks(portfolio.id);

        const overallRisk = (assetsRisk + transactionsRisk) * investmentStrategy;
        return {
            assetsRisk,
            transactionsRisk,
            investmentStrategy,
            overallRisk
        };
    }

    @MessagePattern({ cmd: 'get_portfolios_by_user' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getPortfoliosByUser(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<any> {
        const {user} = payload
        return await this.portfolioService.getPortfoliosByUser(user.userId);
    }

    @MessagePattern({ cmd: 'get_portfolio_by_id' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getPortfolioById(@Payload() payload:{ id: string ,user: { userId: string, email: string, roles: { id: string, name: string } }}): Promise<any> {
        return await this.portfolioService.getPortfolioById(payload.id);
    }

    @MessagePattern({ cmd: 'update_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async updatePortfolio(@Payload() payload:{ id: string, portfolioDto: PortfolioDto ,user: { userId: string, email: string, roles: { id: string, name: string } } }): Promise<any> {
        return await this.portfolioService.updatePortfolio(payload.id, payload.portfolioDto);
    }

    @MessagePattern({ cmd: 'delete_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async deletePortfolio(@Payload() payload:{ id: string ,user: { userId: string, email: string, roles: { id: string, name: string } }}): Promise<any> {
        return await this.portfolioService.deletePortfolio(payload.id);
    }
}
