import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, RoleEnum, Roles, RolesGuard, User } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @MessagePattern({ cmd: 'register_user' })
    async registerUser(
        @Payload() createUserDto: CreateUserDto
    ) {
        try {
            console.log(createUserDto)
            const newUser = await this.userService.register(createUserDto);

            await this.userService.sendVerificationEmail(newUser);

            newUser.password = '';
            return newUser;
        } catch (error) {
            return {
                status: 400,
                message: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'get_me' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getMe(@Payload() payload: { user: { userId: string, email: string, roles: { id: string, name: string } } }) {
        const { email } = payload.user;
        return await this.userService.getMe(email);
    }

    @MessagePattern({ cmd: 'verify_email' })
    async verifyAccount(@Payload() payload: { data: any }) {
        return await this.userService.verifyAccount(payload.data)
    }

    @MessagePattern({ cmd: 'get_user_risk' })
    async getUserDetails(@Payload() payload :{id:string }) {
        return this.userService.calculateUserRiskMetrics(payload.id);
    }

    @MessagePattern({ cmd: 'create_role' })
    async createRole(data: { name: string }) {
        const { name } = data;
        return await this.userService.createRole(name);
    }

    @MessagePattern({ cmd: 'get_all_roles' }) 
    async getAllRoles() {
        return await this.userService.getAllRoles();
    } 

    @MessagePattern({ cmd: 'add_role_to_user' })
    // @Roles(RoleEnum.RISK_SERVICE, RoleEnum.ADMIN)
    // @UseGuards(RolesGuard)
    async addRole(@Payload() payload: { id: string, roleName: string ,service?:string })
        : Promise<User>
    {
        console.log("user tcp controller/adding role ",payload)
        const { id, roleName } = payload;
        return await this.userService.addRole(id , roleName);
    }
}
