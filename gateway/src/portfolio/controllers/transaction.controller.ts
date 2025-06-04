import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { JwtAuthGuard, Transaction, TransactionDto } from '@amenferjani/shared-lib';

@Controller('portfolio/:portfolioId/transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createTransaction(
        @Param('portfolioId') portfolioId: string,
        @Body() transactionDto: TransactionDto,
        @Req() req
    ): Promise<Transaction>{
        return this.transactionService.createTransaction(portfolioId,transactionDto,req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getTransactions(@Param('portfolioId') portfolioId: string ,@Req() req): Promise<Transaction[]> {
        return this.transactionService.getTransactionsByPortfolio(portfolioId, req.user);
    }

    @Get('asset/:assetId')
    @UseGuards(JwtAuthGuard)
    async getTransactionsByAsset(@Param('assetId') assetId: string ,@Req() req): Promise<Transaction[]> {
        return this.transactionService.getTransactionsByAsset(assetId, req.user);
    }

    @Delete(':transactionId')
    @UseGuards(JwtAuthGuard)
    async deleteTransaction(@Param('transactionId') transactionId: string ,@Req() req) {
        return this.transactionService.deleteTransaction(transactionId, req.user);
    }

    @Get('monthly-performance')
    @UseGuards(JwtAuthGuard)
    async getMonthlyPerformance(@Param('portfolioId') portfolioId: string ,@Req() req): Promise<{ month: string; value: number }[]> {
        return this.transactionService.getMonthlyPerformance(portfolioId, req.user);
    }
}
