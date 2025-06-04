import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { CompanyDto ,JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('rel-vest/companies')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Post()
    @UseGuards(JwtAuthGuard) 
    async addCompany(@Body() companyDto: CompanyDto, @Req() req) {
        const user = req.user;
        return this.companyService.addCompany(companyDto, user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updateCompany(
        @Param('id') id: string,
        @Body() companyDto: CompanyDto,
        @Req() req
    ) {
        const user = req.user;
        return this.companyService.updateCompany(id, companyDto, user);
    }

    @Get()
    @UseGuards(JwtAuthGuard) 
    async getCompanies(@Query() filters: any, @Req() req) {
        console.log("http companies controller get by filter",filters)
        const user = req.user;
        return this.companyService.getCompanies(filters, user);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard) 
    async getCompanyDetails(@Param('id') id: string, @Req() req) {
        const user = req.user;
        return this.companyService.getCompanyDetails(id, user);
    }
    
    @Delete(':id')
    @UseGuards(JwtAuthGuard) 
    async deleteCompany(@Param('id') id: string, @Req() req) {
        console.log("http delete company method",id,req.user)
        const user = req.user;
        return this.companyService.deleteCompany(id, user);
    }
}