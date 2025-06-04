import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UserService } from './user.service';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendEmailNotificationByEmail(to: string, subject: string, body: string): Promise<void> {
        try {
            console.log("email service:",to)
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER, 
                to:to,
                subject,
                html: body,
        });
        console.log(`Email sent to ${to}`);
        } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw error;
        }
    }

    async sendEmailNotificationByUserId(to: string, subject: string, body: string): Promise<void> {
        try {
            console.log("email service:", to)
            const user = await this.userService.getUserDetails(to);
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject,
                html: body,
            });
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }
}
