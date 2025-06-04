import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AlertService } from '../services/alert.service';
import { CreateAlertDto } from '@amenferjani/shared-lib';
import { MarketAlert,JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('risk-vest/alert')
@UseGuards(JwtAuthGuard) 
export class AlertController {
    constructor(private readonly alertService: AlertService) {}

    @Post()
    async createAlert(@Body() alertData: CreateAlertDto, @Req() req): Promise<any> {
        const user = req.user; 
        return this.alertService.createAlert(alertData, user);
    }

    @Get()
    async getUserAlerts(@Req() req): Promise<MarketAlert[]> {
        const user = req.user; 
        return this.alertService.getUserAlerts(user);
    }

    @Patch(':alertId')
    async updateAlert(
        @Param('alertId') alertId: string,
        @Body() updateData: Partial<CreateAlertDto>,
        @Req() req,
    ): Promise<MarketAlert> {
        const user = req.user; 
        return this.alertService.updateAlert(alertId, updateData,user);
    }

    @Delete(':alertId')
    async deleteAlert(@Param('alertId') alertId: string, @Req() req): Promise<void> {
        const user = req.user; 
        return this.alertService.deleteAlert(alertId,user);
    }
}
