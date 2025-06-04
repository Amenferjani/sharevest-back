import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionService } from '../services/transaction.service';
import { RoleEnum, Roles, RolesGuard, Transaction, TransactionDto } from '@amenferjani/shared-lib';

@Controller()
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @MessagePattern({ cmd: 'create_transaction' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async createTransaction(@Payload() payload:
        {
            portfolioId: string, transactionDto: TransactionDto,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }) : Promise<Transaction>{
        const { portfolioId, transactionDto, user } = payload;
        return this.transactionService.createTransaction(portfolioId, transactionDto);
    }

    @MessagePattern({ cmd: 'get_transactions_by_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getTransactionsByPortfolio(@Payload() payload:
        {
            portfolioId: string,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }): Promise<Transaction[]> {
        const { portfolioId, user } = payload;
        console.log("tcp transactions controller : ",payload)

        return this.transactionService.getTransactionsByPortfolio(portfolioId);
    }

    @MessagePattern({ cmd: 'get_transactions_by_asset' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getTransactionsByAsset(@Payload() payload:
        {
            assetId: string,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }): Promise<Transaction[]> {
        const { assetId, user } = payload;
        return this.transactionService.getTransactionsByAsset(assetId);
    }

    @MessagePattern({ cmd: 'delete_transaction' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async deleteTransaction(@Payload() payload: { transactionId: string, user: { userId: string, email: string, roles: { id: string, name: string } } }) {
        const { transactionId, user } = payload;
        return this.transactionService.deleteTransaction(transactionId);
    }

    @MessagePattern({ cmd: 'get_monthly_performance' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getMonthlyPerformance(@Payload() payload:{ portfolioId: string ,user: { userId: string, email: string, roles: { id: string, name: string } }}): Promise<{ month: string; value: number }[]> {
        return await this.transactionService.getMonthlyPerformance(payload.portfolioId);
    }
}
