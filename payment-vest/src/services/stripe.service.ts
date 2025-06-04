import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto, PaymentStatus, PaymentTransaction } from '@amenferjani/shared-lib';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        @InjectRepository(PaymentTransaction)
        private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    ) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
    }

    async createCheckoutSession(
        amount: number,
        currency: string,
        successUrl: string,
        cancelUrl: string,
        name: string,
        userId: string,
        email: string,
    ): Promise<string> {
        try {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
            {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: name, 
                    },
                    unit_amount: amount * 100, 
                },
                    quantity: 1,
            },
            ],
            mode: 'payment', 
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: userId,
                email : email,
                investmentAmount: amount, 
            },
        });
            
            await this.createPayment(
                {
                    amount: amount,
                    currency: currency,
                    status: PaymentStatus.PENDING,
                    userId: userId,
                    email: email,
                    provider: 'stripe',
                    sessionId: session.id,
                    intentId:""
                }
            );
            console.log(session.url)
            return session.url; 
        } catch (error) {
        console.error('Error creating Stripe Checkout session:', error);
        throw new InternalServerErrorException('Failed to create checkout session');
        }
    }

    async createRefund(paymentIntentId: string): Promise<Stripe.Refund> {
        // todo : add refunded status to payment status enum in db 
        // todo : add logic to update status on webhook event 
        return await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    }

    //! CRUD :
    async createPayment(createPaymentDto: CreatePaymentDto): Promise<void> {
        const payment = this.paymentTransactionRepository.create(createPaymentDto);
        await this.paymentTransactionRepository.save(payment);
    }

    async findAllPayments(): Promise<PaymentTransaction[]> {
        return await this.paymentTransactionRepository.find();
    }

    async findPaymentById(id: string): Promise<PaymentTransaction> {
        return await this.paymentTransactionRepository.findOne({where :{id}});
    }

    async updatePaymentStatus(id: string, status: PaymentStatus): Promise<PaymentTransaction> {
        const payment = await this.paymentTransactionRepository.findOne({where :{id}});
        if (!payment) {
            throw new Error('Payment not found');
        }

        payment.status = status;
        return await this.paymentTransactionRepository.save(payment);
    }

    async deletePayment(id: string): Promise<void> {
        await this.paymentTransactionRepository.delete(id);
    }

}
