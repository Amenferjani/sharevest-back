import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthGuard, JwtAuthGuard, RefreshJwtAuthGuard } from '@amenferjani/shared-lib';
// import { GoogleAuthGuard } from 'src/auth/guards/googleAuth.guard';

@Controller('users/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Res() res,@Body() body: { email: string; pass: string }){
        try {
            const user = await this.authService.login(body);
            res.cookie('access_token', user.access_token, {
                    httpOnly: true, 
                    secure: false, 
                    maxAge: 3600 * 1000,
                    sameSite: 'Strict',
                    path: '/', 
            });
            res.cookie('refresh_token', user.refresh_token, {
                    httpOnly: true, 
                    secure: false, 
                    maxAge: 3600 * 1000,
                    sameSite: 'Strict',
                    path: '/', 
            });
            console.log("gateway login",user)
            res.json(user);
        } catch (error) {
            throw error
        }
    }

    @Post('refresh-token')
    @UseGuards(RefreshJwtAuthGuard)
    async refreshToken(@Req() req) {
        const user = {
            ...req.user,
            roles: Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles] 
        };
        return this.authService.refreshToken(user);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    //todo : change it to refresh guard after updating the guard to handle cookies not headers
    logout(@Res({ passthrough: true }) res) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict', 
            path: '/',
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        });

        return { message: 'Logged out successfully' };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {}

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Req() req, @Res() res) {
        console.log("google callback ", req.user);
        try {
            const user = await this.authService.handleGoogleLogin(req.user);
            res.cookie('access_token', user.access_token, {
                httpOnly: true, 
                secure: false, 
                maxAge: 3600 * 1000,
                sameSite: 'Strict',
            });
            res.cookie('refresh_token', user.refresh_token, {
                httpOnly: true,
                secure: false,
                maxAge: 3600 * 1000,
                sameSite: 'Strict',
                path: '/',
            });
            res.json(user);
        } catch (err: any) {
            return res.redirect(`http://localhost:8080/login?error=${err.message}`);
        }
    }
}
