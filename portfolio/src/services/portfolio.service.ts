import { Injectable, NotFoundException, OnModuleInit ,Logger, ConflictException} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InvestmentStrategy, Portfolio } from '@amenferjani/shared-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioDto } from '@amenferjani/shared-lib';
import { Asset } from '@amenferjani/shared-lib';
import { Transaction } from '@amenferjani/shared-lib';

const InvestmentStrategyRiskModifiers = {
    [InvestmentStrategy.CONSERVATIVE]: 0.8,
    [InvestmentStrategy.BALANCED]: 1.0,
    [InvestmentStrategy.AGGRESSIVE]: 1.2,
    [InvestmentStrategy.INCOME]: 0.9,
    [InvestmentStrategy.GROWTH]: 1.1,
    [InvestmentStrategy.INDEX]: 0.95,
    [InvestmentStrategy.VALUE]: 1.05,
    [InvestmentStrategy.MOMENTUM]: 1.3,
};

@Injectable()
export class PortfolioService
{
    constructor(
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
        @InjectRepository(Asset)
        private readonly assetRepo: Repository<Asset>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) {}

    checkHealth(): string {
        return 'Portfolio service!';
    }
    async findAll(): Promise<Portfolio[]> {
        return this.portfolioRepo.find(); // Simple query to fetch all records
    }

    async getInvestmentStrategy(strategy: string): Promise<number>{
        
        return InvestmentStrategyRiskModifiers[strategy];
    }

    async createPortfolio(portfolioDto: PortfolioDto): Promise<Portfolio> {
        const existingPortfolio = await this.portfolioRepo.findOne({ where: { userId: portfolioDto.userId } })
        if (existingPortfolio) {
            throw new ConflictException('portfolio already exist');
        }
        const newPortfolio = this.portfolioRepo.create(portfolioDto);

        return await this.portfolioRepo.save(newPortfolio);
    }

    async getPortfoliosByUser(userId: string): Promise<Portfolio> {
        const portfolio =  await this.portfolioRepo.findOne({ where: { userId:userId } });
        if (!portfolio) {
            return this.createPortfolio({ userId: userId });
        }
        return portfolio;
    }

    async getPortfolioById(id: string): Promise<Portfolio> {
        const portfolio = await this.portfolioRepo.findOne({ where: { id } });
        if (!portfolio) {
            throw new NotFoundException(`Portfolio with ID ${id} not found`);
        }
        return portfolio;
    }

    async updatePortfolio(id: string, portfolioDto: PortfolioDto): Promise<Portfolio> {
        const portfolio = await this.getPortfolioById(id);
        Object.assign(portfolio, portfolioDto);
        return await this.portfolioRepo.save(portfolio);
    }

    async deletePortfolio(id: string): Promise<void> {
        const result = await this.portfolioRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Portfolio with ID ${id} not found`);
        }
    }
}
