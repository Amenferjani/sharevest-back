import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthGuard } from '@amenferjani/shared-lib';
import { Roles } from '@amenferjani/shared-lib';
import { RoleEnum } from '@amenferjani/shared-lib';
import { RolesGuard } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @MessagePattern({ cmd: 'login_user' })
    async login(@Body() body: { email: string; pass: string }): Promise<any> {
        const { email, pass } = body;
        try {
            const user = await this.authService.validateUser(email, pass);
            return this.authService.login(user);
        } catch (error) {
            throw error;
        }
    }

    @MessagePattern({cmd :'refresh_token'})
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards( RolesGuard)
    async refreshToken(@Payload() payload:{user: {userId:string, email: string, roles:{id:string , name: string} }}) {
        try {
            const {user} = payload
            console.log("tcp :" ,user)
            return this.authService.refreshToken(user);
        } catch (error) {
            throw error;
        }
    }

    @MessagePattern({cmd :'google_callback'})
    async googleAuthRedirect(@Payload() user: any) {
        const loggedInUser = await this.authService.handleGoogleLogin(user);
        return this.authService.login(loggedInUser);
    }
}
