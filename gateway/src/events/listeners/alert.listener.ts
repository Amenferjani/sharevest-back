import { Controller, Injectable, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationGateway } from '../notification.gateway';
import { MarketAlert} from '@amenferjani/shared-lib';


@Controller()
export class AlertListener implements OnModuleInit {
    constructor(private readonly notificationGateway: NotificationGateway) {}

    @EventPattern({cmd:'send_alert_notification'})
    handleRiskAlert(@Payload() payload: { alert: MarketAlert }) {
        const { alert } = payload;
        console.log('Received Risk Alert:', alert);
        this.notificationGateway.sendRiskAlert(alert.userId, alert.message);
    }

    onModuleInit() {
        console.log('AlertListener initialized!');
    }
}
