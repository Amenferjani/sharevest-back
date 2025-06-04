import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, TransactionDto, TransactionType } from '@amenferjani/shared-lib'; 
import { Portfolio } from '@amenferjani/shared-lib';
import { AssetDto } from '@amenferjani/shared-lib';
import { TransactionService } from './transaction.service';

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
        private readonly transactionService: TransactionService,
    ) {}

    async addAssetToPortfolio(portfolioId: string, assetDto: AssetDto): Promise<Asset> {
        const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId } });
        if (!portfolio) throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);

        const asset = this.assetRepository.create({ ...assetDto, portfolio });
        return this.assetRepository.save(asset);
    }

    async removeAssetFromPortfolio(
        portfolioId: string,
        assetId: string,
        sellingQuantity: number
        ): Promise<void> {
        const asset = await this.assetRepository.findOne({
            where: { id: assetId, portfolio: { id: portfolioId } },
        });
        if (!asset) {
            throw new NotFoundException(
            `Asset with ID ${assetId} not found in Portfolio ID ${portfolioId}`
            );
        }

        // Always record the transaction first
        const transactionData: TransactionDto = {
            assetId: assetId,
            portfolioId: portfolioId,
            type: TransactionType.SELL,
            quantity: Math.min(sellingQuantity, asset.quantity),
            price: asset.currentPrice,
        };
        const savedTransaction = await this.transactionService.createTransaction(portfolioId, transactionData);
        console.log("asset tcp service",savedTransaction);
        if (sellingQuantity < asset.quantity) {
            // Only reduce quantity, do not remove asset
            asset.quantity = asset.quantity - sellingQuantity;
            await this.assetRepository.save(asset);
        } else {
            // Remove the asset completely
            await this.assetRepository.remove(asset);
        }
    }


    async getAssetsInPortfolio(portfolioId: string): Promise<Asset[]> {
        const assets = await this.assetRepository.find({
                where: { portfolio: { id: portfolioId } },
                relations: [ 'portfolio'], 
            },
        );
        if (assets.length === 0) return [];

        return assets;
    }

    async calculateAssetRisks(portfolioId: string): Promise<number> {
        const assets = await this.getAssetsInPortfolio(portfolioId);
        if (!assets && assets.length === 0) return 0;
        const risks = assets.map(asset => {
            const text = String(asset.riskFactor || "0").replace(/[^0-9.]/g, "");
            return parseFloat(text) || 0;
        });

        const totalRisk = risks.reduce((sum, r) => sum + r, 0);
        return risks.length ? totalRisk / risks.length : 0;
    }
}
