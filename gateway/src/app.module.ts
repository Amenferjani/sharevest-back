import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PartVestModule } from './part-vest/part-vest.module';
import { RiskVestModule } from './risk-vest/risk-vest.module';
import { EventModule } from './events/event.module';
import { HedgeFundModule } from './hedge-vest/hedge-fund.module';
import { PrivateVestModule } from './private-vest/private-vest.module';
import { AppController } from './app.controller';
import { RelVestModule } from './rel-vest/rel-vest.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    PortfolioModule,
    PartVestModule,
    RiskVestModule,
    HedgeFundModule,
    PrivateVestModule,
    RelVestModule,
    PaymentModule,
    EventModule,
  ],
  controllers:[AppController]
})
export class AppModule{}

