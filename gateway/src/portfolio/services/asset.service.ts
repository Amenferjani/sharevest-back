import { Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Asset, AssetDto } from '@amenferjani/shared-lib';

@Injectable()
export class AssetService {
    constructor(
        @Inject('PORTFOLIO_SERVICE') private readonly portfolioServiceClient: ClientProxy
    ) {}

    async addAssetToPortfolio(portfolioId: string, assetDto: AssetDto ,user:any): Promise<Asset> {
        return this.portfolioServiceClient
            .send({ cmd: 'add_asset_to_portfolio' }, { portfolioId, assetDto ,user})
            .toPromise();
    }

    async removeAssetFromPortfolio(portfolioId: string, sellingQuantity: number, assetId: string, user: any): Promise<any> {
        try {
            
        return this.portfolioServiceClient
            .send({ cmd: 'remove_asset_from_portfolio' }, { portfolioId, sellingQuantity, assetId ,user})
            .toPromise();
        } catch (err) {
            throw new RpcException(err);
        }
    }

    async getAssetsInPortfolio(portfolioId: string ,user:any): Promise<Asset[]> {
        return this.portfolioServiceClient
            .send({ cmd: 'get_assets_in_portfolio' }, { portfolioId ,user})
            .toPromise();
    }
}