import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from '@amenferjani/shared-lib';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService, 
    ) {}

    async validateUser(email: string, pass: string) :Promise<User> {
        const user = await this.userService.findByEmail(email); 
        console.log("validate user",user)
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Wrong password');
        }
        user.password = ""; 
        return user;
    }

    async login(user: User) {
        const payload = {
            email: user.email,
            sub: user.id,
            roles:user.role,
        };
        const result = {
            user,
            access_token: this.jwtService.sign(payload , { expiresIn: '1h' }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
        return result;
    }

    async refreshToken(user: { userId: string, email: string, roles:{id:string , name: string} }) {
        const newAccessToken = this.jwtService.sign({
            email: user.email,
            sub: user.userId,
            roles:user.roles
        });

        return { access_token: newAccessToken };
    }

    async handleGoogleLogin(googleUser: any): Promise<any> {
        const { email, id: googleId, name, picture } = googleUser;

        let user = await this.userService.findByGoogleId(googleId);
        // if (!user) {
        //     user = await this.userService.findByEmail(email);
        // }

        if (!user) {
            user = await this.userService.register({
                username: name,
                email,
                password: "",
                googleId, 
                picture, 
                isEmailVerified : true
            });
        }
        console.log('USER FROM DB:', user);
        return user;
    }
}
