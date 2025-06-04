import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MarketAlertService } from '../services/market-alert.service';
import { CreateAlertDto, RolesGuard ,Roles, RoleEnum} from '@amenferjani/shared-lib';
import { MarketAlert } from '@amenferjani/shared-lib';

@Controller()
export class MarketAlertController {
    constructor(private readonly marketAlertService: MarketAlertService) {}

    @MessagePattern({ cmd: 'create_alert' })
    @Roles(RoleEnum.USER,RoleEnum.PREMIUM_USER,RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async createAlert(@Payload() payload : {
        alertData: CreateAlertDto,
        user: {
            userId : string,
            email : string,
            roles: { id : string, name : string }
        }
    }) : Promise<MarketAlert> {
        const { alertData, user } = payload;
        return this.marketAlertService.createAlert({ ...alertData,userId : user.userId});
    }

    @MessagePattern({ cmd: 'get_user_alerts' })
    @Roles(RoleEnum.USER,RoleEnum.PREMIUM_USER,RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getUserAlerts(@Payload() payload: {
        user: {
            userId : string,
            email : string,
            roles: { id : string, name : string }
        }
    }): Promise<MarketAlert[]> {
        const {user} = payload
        return this.marketAlertService.getUserAlerts(user.userId);
    }

    @MessagePattern({ cmd: 'update_alert' }) 
    @Roles(RoleEnum.USER,RoleEnum.PREMIUM_USER,RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async updateAlert(
        @Payload() payload: {
            user: {
                userId : string,
                email : string,
                roles: { id : string, name : string }
            },
            alertId: string,
            updateData: Partial<CreateAlertDto>,
        },
    ): Promise<MarketAlert> {
        const { alertId, updateData } = payload;
        return this.marketAlertService.updateAlert(alertId, updateData);
    }

    @MessagePattern({ cmd: 'delete_alert' }) 
    @Roles(RoleEnum.USER,RoleEnum.PREMIUM_USER,RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async deleteAlert(@Payload() payload: {
        alertId: string,
        user: {
            userId : string,
            email : string,
            roles: { id : string, name : string }
        }
    }): Promise<void> {
        const { alertId } = payload;
        return this.marketAlertService.deleteAlert(alertId);
    }
}
