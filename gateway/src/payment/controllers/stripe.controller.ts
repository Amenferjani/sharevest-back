import { BadRequestException, Body, Controller, Post,Headers, Req, RawBodyRequest, UseGuards, Get, Delete, Param } from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('payment/stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @Post('webhook')
    async handleStripeWebhook(
        @Req() req ,
        @Headers('Stripe-Signature') signature: string,
    ) {
        // console.log("test",req.body)

        try {
            await this.stripeService.sendWebhookData(signature, req.body);
        return { message: 'Webhook processed successfully' };
        } catch (error) {
            throw BadRequestException;
        }
    }
    // @Post('test')
    // async test(
    // ) {
    //     try {
    //         await this.stripeService.test();
    //     return { message: 'Webhook processed successfully' };
    //     } catch (error) {
    //         throw BadRequestException;
    //     }
    // }

    @Post('checkout')
    // @UseGuards(JwtAuthGuard)
    async createCheckoutSession(
        @Req() req,
        // @Body() data: { amount: number; currency: string; name: string; userId: string; email: string}
    ) {
        const data = {
            amount: 1000,
            currency: 'USD',
            name: 'Test Product',
            userId: 'e8e22a4f-581e-4b7d-8ea2-8f1340ddc803',
            email: 'amenferjani23@gmail.com',
            sessionId :'e8e22a4f-581e-4b7d-8ea2-8f1340ddc803'
        };
            return await this.stripeService.sendCreateCheckoutSession({...data , user : req.user});
            // return { message: 'Checkout session created successfully' };
        
    }

    @UseGuards(JwtAuthGuard)
    @Post('refund')
    async requestRefund(@Req() req, @Body() body: { paymentIntentId: string }) {
        const user = req.user;
        const { paymentIntentId } = body;
        return await this.stripeService.sendRefundRequest(paymentIntentId, user);
    }


    @UseGuards(JwtAuthGuard)
    @Get()
    async findUserPayments(@Req() req) {
        const user = req.user; 
        return await this.stripeService.sendFindAllPayments(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findPaymentById(@Param('id') id: string, @Req() req) {
        const user = req.user; 
        return await this.stripeService.sendFindPaymentById(id, user);
    }

}
