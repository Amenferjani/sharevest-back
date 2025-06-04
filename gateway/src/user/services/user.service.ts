import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CreateUserDto, Role, User } from '@amenferjani/shared-lib';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @Inject('USER_SERVICE') private readonly client: ClientProxy,
        private readonly jwtService: JwtService,
    ) { }

    async registerUser(createUserDto: CreateUserDto) : Promise<User> {
        console.log("registerUser" , createUserDto)
        return this.client.send({ cmd: 'register_user' }, createUserDto).toPromise();
    }

    async getMe( user: { userId: string, email: string, roles: { id: string, name: string } } ): Promise<User> {
        return this.client.send({ cmd: 'get_me' }, {user}).toPromise();
    }

    async calculateUserRiskMetrics(user: { userId: string, email: string, roles: { id: string, name: string } }): Promise<{ riskTolerance: number, overallRiskScore: number }> {
        return this.client.send({ cmd: 'get_user_risk' }, {user}).toPromise();
    }

    async createRole(body: { name: string }): Promise<Role> {
        return this.client.send({ cmd: 'create_role' }, body).toPromise();
    }

    async getAllRoles(): Promise<Role[]>{
        return this.client.send({ cmd: 'get_all_roles' }, {}).toPromise();
    }

    async addRole(body:{id: string, roleName: string} ): Promise<User> {
        return this.client.send({ cmd: 'add_role_to_user' }, body).toPromise();
    }

    async verifyEmail(token: string): Promise<{ message: string }> {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.EMAIL_VERIFICATION_SECRET,
            });

            console.log("Decoded token payload:", payload);
            return this.client.send({ cmd: 'verify_email' }, { data:payload }).toPromise();
            
        } catch (error) {
            throw new BadRequestException('Invalid or expired verification token.');
        }
    }
}
