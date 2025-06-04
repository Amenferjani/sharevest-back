import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './services/user.service';
import { Permission, RolesGuard } from '@amenferjani/shared-lib';
import { Role } from '@amenferjani/shared-lib';
import { User } from '@amenferjani/shared-lib';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@amenferjani/shared-lib';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'user_user',
      password: 'user_pass',
      database: 'user_db',
      ssl: false,
      entities: [User, Role, Permission],
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  providers: [UserService, AuthService, EmailService],
  controllers: [UserController, AuthController, EmailController],
})
export class UserModule {}
