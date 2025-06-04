import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { AlertListener } from './listeners/alert.listener';

@Module({
    controllers:[ AlertListener],
    providers: [NotificationGateway,], 
    exports: [NotificationGateway], 
})
export class EventModule {}
