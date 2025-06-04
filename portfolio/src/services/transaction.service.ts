import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '@amenferjani/shared-lib';
import { TransactionDto } from '@amenferjani/shared-lib';
import { Portfolio } from '@amenferjani/shared-lib';
import { Asset } from '@amenferjani/shared-lib';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
    ) {}

    async createTransaction(portfolioId:string ,transactionDto: TransactionDto): Promise<Transaction> {
        const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId } });
        if (!portfolio) throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);

        const asset = await this.assetRepository.findOne({ where: { id: transactionDto.assetId } });
        if (!asset) throw new NotFoundException(`Asset with ID ${transactionDto.assetId} not found`);
            
        const transaction = this.transactionRepository.create({
            ...transactionDto,
            portfolio: portfolio,
            asset : asset,
        });
        return this.transactionRepository.save(transaction);
    }

    async getTransactionsByPortfolio(portfolioId: string): Promise<Transaction[]> {
        const transactions = await this.transactionRepository.find({
            where: { portfolio: { id: portfolioId } },
            relations: ['asset', 'portfolio'], 
        });
        if(!transactions){
            throw new NotFoundException("transaction not found");
        }
        console.log("tcp transactions service : ",transactions)
        return transactions;
    }

    async getTransactionsByAsset(assetId: string): Promise<Transaction[]> {
        const transactions = await this.transactionRepository.find({
            where: { asset: { id: assetId } },
            relations: ['asset'], 
        });
        if(!transactions){
            throw new NotFoundException("transaction not found");
        }
        console.log("tcp transactions service : ",transactions)
        return transactions;
    }
    async calculateTransactionRisks(portfolioId: string): Promise<number> {
        const transactions = await this.getTransactionsByPortfolio(portfolioId);
        if (!transactions || transactions.length === 0) return 0 ;

        const impacts: number[] = transactions.map(tx => {
            const txt = String(tx.transactionRiskImpact || "0").replace(/[^0-9.]/g, "");
            return parseFloat(txt) || 0;
        });

        const totalRisk = impacts.reduce((sum, i) => sum + i, 0);

        return impacts.length ? totalRisk / impacts.length : 0;
    }


    async deleteTransaction(transactionId: string): Promise<void> {
        const result = await this.transactionRepository.delete(transactionId);
        if (result.affected === 0) throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    async getMonthlyPerformance(portfolioId: string) {
        const transactions = await this.transactionRepository.find({
        where: { portfolio: { id: portfolioId } },
        relations: ['asset'],
        order: { transactionDate: 'ASC' },
        });

        const performanceByMonth: Record<string, number> = {};

        for (const tx of transactions) {
            const date = new Date(tx.transactionDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Example: 2024-04

            const amount = Number(tx.quantity) * Number(tx.price);

            if (!performanceByMonth[monthKey]) {
                performanceByMonth[monthKey] = 0;
            }

            if (tx.type === TransactionType.BUY) {
                performanceByMonth[monthKey] -= amount; // Buying = spending money
            } else if (tx.type === TransactionType.SELL) {
                performanceByMonth[monthKey] += amount; // Selling = gaining money
            }
        }

        const cumulativePerformance: { month: string; value: number }[] = [];
        let cumulativeValue = 0;
        for (const month of Object.keys(performanceByMonth).sort()) {
            cumulativeValue += performanceByMonth[month];
            cumulativePerformance.push({ month, value: cumulativeValue });
        }

        return cumulativePerformance;
    }
}


