import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAlertDto } from '@amenferjani/shared-lib';
import { MarketAlert } from '@amenferjani/shared-lib';

@Injectable()
export class AlertService {
    @Inject('RISK_VEST_SERVICE') private readonly client: ClientProxy;

    async createAlert(alertData: CreateAlertDto, user: { userId: string; email: string; roles: { id: string; name: string } }): Promise<MarketAlert> {
        console.log(user , alertData)
        return this.client.send({ cmd: 'create_alert' }, { alertData, user }).toPromise();
        
    }

    async getUserAlerts(user: { userId: string; email: string; roles: { id: string; name: string } }): Promise<MarketAlert[]> {
        return this.client.send({ cmd: 'get_user_alerts' }, {user}).toPromise();
    }

    async updateAlert(
        alertId: string,
        updateData: Partial<CreateAlertDto>,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ): Promise<MarketAlert> {
        return this.client.send({ cmd: 'update_alert' }, { alertId, updateData, user }).toPromise();
    }

    async deleteAlert(alertId: string, user: { userId: string; email: string; roles: { id: string; name: string } }): Promise<void> {
        return this.client.send({ cmd: 'delete_alert' }, { alertId, user }).toPromise();
    }
}
