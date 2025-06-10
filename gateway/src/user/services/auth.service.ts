import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

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
        try {
            return this.client.send({ cmd: 'google_callback' }, user).toPromise();
        } catch (err) {
            const error = err instanceof RpcException ? err.getError() : err;

            if (error?.code === 409) {
                throw new ConflictException(error.message);
            }

            throw new InternalServerErrorException('Something went wrong during Google login.');
        }
    }
}
