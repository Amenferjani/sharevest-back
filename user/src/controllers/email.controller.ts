import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../services/email.service';

@Controller()
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @EventPattern({ cmd: 'send_email_notification' })
    async handleEmailNotification(@Payload() payload: { to: string; subject: string; body: string }): Promise<void> {
        const { to, subject, body } = payload;
        await this.emailService.sendEmailNotificationByUserId(to, subject, body);
    }
}
