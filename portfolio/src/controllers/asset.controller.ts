import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssetService } from '../services/asset.service';
import { Asset, AssetDto, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';

@Controller()
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @MessagePattern({ cmd: 'add_asset_to_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async addAssetToPortfolio(
        @Payload() payload: { portfolioId: string, assetDto: AssetDto , user: { userId: string, email: string, roles: { id: string, name: string } } }
    ): Promise<Asset> {
        const { portfolioId, assetDto } = payload;
        return await this.assetService.addAssetToPortfolio(portfolioId, assetDto);
    }

    @MessagePattern({ cmd: 'remove_asset_from_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async removeAssetFromPortfolio(
        @Payload() payload: { portfolioId: string ,sellingQuantity : number,assetId: string, user: { userId: string, email: string, roles: { id: string, name: string } } }
    ): Promise<any> {
        const { portfolioId, assetId, sellingQuantity } = payload;
        console.log(payload)
        return await this.assetService.removeAssetFromPortfolio(portfolioId, assetId, Number(sellingQuantity));
    }

    @MessagePattern({ cmd: 'get_assets_in_portfolio' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async getAssetsInPortfolio(
        @Payload() payload: { portfolioId: string , user: { userId: string, email: string, roles: { id: string, name: string } } }
    ): Promise<Asset[]> {
        const { portfolioId } = payload;
        return await this.assetService.getAssetsInPortfolio(portfolioId);
    }
}
