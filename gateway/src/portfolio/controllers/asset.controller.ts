import { AssetService } from '../services/asset.service'; 
import { Asset, AssetDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib';
import { Controller, Post, Delete, Get, Body, UseGuards, Req, Param, Query } from '@nestjs/common';


@Controller('portfolio/:portfolioId/assets')
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async addAsset(
        @Param('portfolioId') portfolioId: string, 
        @Body() assetDto: AssetDto, 
        @Req() req
    ): Promise<Asset> {
        return this.assetService.addAssetToPortfolio(portfolioId, assetDto, req.user);
    }

    @Delete(':assetId')
    @UseGuards(JwtAuthGuard)
    async removeAsset(@Param('portfolioId') portfolioId: string,
        @Query('sellingQuantity') sellingQuantity: number,
        @Param('assetId') assetId: string, @Req() req
    ) {
        console.log(portfolioId, sellingQuantity, assetId,req.user)
        return this.assetService.removeAssetFromPortfolio(portfolioId,sellingQuantity, assetId, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAssets(@Param('portfolioId') portfolioId: string,@Req() req) {
        return this.assetService.getAssetsInPortfolio(portfolioId, req.user);
    }
}
