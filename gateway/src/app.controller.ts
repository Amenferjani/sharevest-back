import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

@Controller('gateway')
export class AppController {

    @Get('health')
    async login() {
        return "gateway health check"
    }
}
