import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_SERVICE') private readonly client: ClientProxy
    ) { }

    async login(body: { email: string; pass: string }) {
        return this.client.send({ cmd: 'login_user' }, body).toPromise();
    }

    async refreshToken(user: { userId: string, email: string, roles:{id:string , name: string}}): Promise<any>{
        console.log('Data sent via client.send:', user);
        return this.client.send({ cmd: 'refresh_token' }, {user}).toPromise();
    }

    async handleGoogleLogin(user: any): Promise<any>{
        return this.client.send({ cmd: 'google_callback' }, user).toPromise();
    }
}
