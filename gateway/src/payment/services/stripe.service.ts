import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    constructor(
        @Inject('PAYMENT_SERVICE') private readonly client: ClientProxy,
        private configService: ConfigService
    ) { 
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
    }

    async sendWebhookData(signature: string, payload: Buffer) {
        try {
            // console.log('Type of req.body:', typeof payload);
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.configService.get<string>('WEBHOOK_SECRET_KEY')
            );

            console.log('Verified Stripe event:');

            switch (event.type) {
                case 'checkout.session.completed':
                    console.log('✅ Session completed:');
                    break;
                case 'payment_intent.succeeded':
                    console.log('✅ Payment succeeded');
                    return await this.client
                        .send({ cmd: 'update-order-paid' }, event.data.object)
                        .toPromise();
                    break;
                
                case 'payment_intent.payment_failed':
                    console.log('❌ Payment failed:');
                    return await this.client
                        .send({ cmd: 'update-order-failed' }, event.data.object)
                        .toPromise();
                    break;
                default:
                    console.log('Unhandled event type:');
            }
        } catch (error) {
            console.error('❌ Error processing Stripe webhook:', error.message);
        }
        // this.client.emit('stripe_webhook', { signature, payload }).toPromise();

    }

    async sendCreateCheckoutSession(data: {
        user: any,
        amount: number, currency: string, name: string, userId: string, email: string
    }): Promise<string> {
        console.log('Webhook processed successfully');

        return await this.client
            .send({ cmd: 'create-checkout-session' }, data)
            .toPromise();
    }

    async sendRefundRequest(paymentIntentId: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return await this.client.send({ cmd: 'create-payment-refund' }, { paymentIntentId, user }).toPromise();
    }


    async test() {
        console.log("Webhook processed successfully ser")
        this.client.send({cmd:'test'},{}).toPromise()
        // return this.client.emit('stripe_webhook', { signature, payload });
    }

    async sendFindAllPayments(user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return await this.client.send({ cmd: 'find-all-payments' }, { user }).toPromise();
    }

    async sendFindPaymentById(id: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return await this.client.send({ cmd: 'find-payment-by-id' }, { id, user }).toPromise();
    }

    async sendDeletePayment(id: string, user: { userId: string; email: string; roles: { id: string; name: string } }) {
        return await this.client.send({ cmd: 'delete-payment' }, { id, user }).toPromise();
    }

}
