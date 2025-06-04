import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy, RefreshJwtStrategy } from '@amenferjani/shared-lib';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.EMAIL_VERIFICATION_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options:{host :"127.0.0.1",port : 3001}
            },
        ]),
    ],
    controllers: [UserController,AuthController],
    providers: [
        UserService,
        AuthService,
        RefreshJwtStrategy,
        GoogleStrategy
    ],
    exports:[UserService]
})
export class UserModule {}
