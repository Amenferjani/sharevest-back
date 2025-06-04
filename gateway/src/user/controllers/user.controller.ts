import { Controller, Post, Body, Get, Param, UseGuards, Patch, Req, Query, Res } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateRoleDto, JwtAuthGuard, RoleEnum } from '@amenferjani/shared-lib';
import { Role } from '@amenferjani/shared-lib';
import { CreateUserDto } from '@amenferjani/shared-lib';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.registerUser(createUserDto);
    }

    @Get('risk')
    @UseGuards(JwtAuthGuard)
    async getUserDetails(@Req() req) {
        return await this.userService.calculateUserRiskMetrics(req.user);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req) {
        return await this.userService.getMe(req.user);
    }

    @Post("role")
    // @UseGuards(JwtAuthGuard)
    async createRole(@Body() body: { name: string }) {
        return await this.userService.createRole(body);
    } 

    @Get("role")
    async getAllRoles() {
        return await this.userService.getAllRoles();
    }

    @Patch("role/add-to-user")
    async addRoleToUser(@Body() body: { id: string, roleName: string }) {
        return await this.userService.addRole(body);
    }

    @Get("verify-email")
    async verifyEmail(@Query('token') token: string, @Res() res) {
        try {
            await this.userService.verifyEmail(token);
            return res.redirect('http://localhost:8080/login/email-verified');
        } catch (error) {
            return res.redirect('http://localhost:8080/login/email-verification-failed');
        }
    }
}
