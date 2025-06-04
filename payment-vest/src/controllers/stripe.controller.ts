import { PaymentStatus, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';
import { Controller, Inject, Logger, UseGuards } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StripeService } from 'src/services/stripe.service';

@Controller()
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @MessagePattern({ cmd: 'test' })
    async test(){
        console.log('test')
    }

    @MessagePattern({ cmd: 'create-checkout-session' })
    // @Roles(RoleEnum.ADMIN,RoleEnum.USER,RoleEnum.PREMIUM_USER)
    // @UseGuards(RolesGuard)
    async createCheckoutSession(data: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
        amount: number; currency: string; name: string; userId: string, email: string
    }): Promise<string> {

        const { amount, currency, name , userId , email } = data;
        //todo : change with success and cancel front end pages
        const successUrl = 'https://www.google.com/';
        const cancelUrl = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn0.iconfinder.com%2Fdata%2Ficons%2Fshift-free%2F32%2FError-512.png&tbnid=FEaYrqalAT4qcM&vet=10CAIQxiAoAGoXChMI4Ofthuu5jAMVAAAAAB0AAAAAEAY..i&imgrefurl=https%3A%2F%2Fwww.iconfinder.com%2Ficons%2F381599%2Ferror_icon&docid=ugoPBsYXnYLvmM&w=512&h=512&itg=1&q=error&ved=0CAIQxiAoAGoXChMI4Ofthuu5jAMVAAAAAB0AAAAAEAY';

        const sessionUrl = await this.stripeService.createCheckoutSession(
            amount,
            currency,
            successUrl,
            cancelUrl,
            name,
            userId,
            email,
        );

        return sessionUrl;
    }

    @MessagePattern({ cmd: 'create-payment-refund' })
    @Roles(RoleEnum.ADMIN,RoleEnum.USER,RoleEnum.PREMIUM_USER)
    @UseGuards(RolesGuard)
    async handleRefund(@Payload() payload: {
        paymentIntentId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        return await this.stripeService.createRefund(payload.paymentIntentId);
    }


    @MessagePattern({ cmd: 'find-all-payments' })
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async findAllPayments(@Payload() payload: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        return await this.stripeService.findAllPayments();
    }

    @MessagePattern({ cmd: 'find-payment-by-id' })
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async findPaymentById(@Payload() payload: {
        id:string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        return await this.stripeService.findPaymentById(payload.id);
    }

    @MessagePattern({ cmd: 'delete-payment' })
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async deletePayment(@Payload() payload: {
        id:string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        await this.stripeService.deletePayment(payload.id);
        return { message: 'Payment deleted successfully' };
    }

    @MessagePattern({ cmd: 'update-order-paid' })
    async updateOrderToPaid(@Payload() data: { id: string }) {
        return await this.stripeService.updatePaymentStatus(data.id, PaymentStatus.COMPLETED);
    }

    @MessagePattern({ cmd: 'update-order-failed' })
    async updateOrderToFailed(@Payload() data: { id: string }) {
        return await this.stripeService.updatePaymentStatus(data.id, PaymentStatus.FAILED);
    }
}
