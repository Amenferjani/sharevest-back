import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Transaction, TransactionDto } from '@amenferjani/shared-lib';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('PORTFOLIO_SERVICE') private readonly portfolioServiceClient: ClientProxy
    ) {}

    async createTransaction(portfolioId: string, transactionDto: TransactionDto, user: any): Promise<Transaction> {
        return this.portfolioServiceClient
            .send({ cmd: 'create_transaction' }, { portfolioId, transactionDto, user })
            .toPromise();
    }

    async getTransactionsByPortfolio(portfolioId: string, user: any): Promise<Transaction[]> {
        return this.portfolioServiceClient
            .send({ cmd: 'get_transactions_by_portfolio' }, { portfolioId, user })
            .toPromise();
    }

    async getTransactionsByAsset(assetId: string, user: any): Promise<Transaction[]>{
        return this.portfolioServiceClient
            .send({ cmd: 'get_transactions_by_asset' }, { assetId, user })
            .toPromise();
    }

    async deleteTransaction(transactionId: string, user: any): Promise<any> {
        return this.portfolioServiceClient
            .send({ cmd: 'delete_transaction' }, { transactionId, user })
            .toPromise();
    }

    async getMonthlyPerformance(portfolioId: string, user: any): Promise<{ month: string; value: number }[]> {
        return this.portfolioServiceClient
            .send({ cmd: 'get_monthly_performance' }, { portfolioId, user })
            .toPromise();
    }
}
