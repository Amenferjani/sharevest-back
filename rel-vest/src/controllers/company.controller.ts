import { Controller, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { RoleEnum, CompanyDto, RolesGuard, Roles } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @MessagePattern({ cmd: 'add_company' })
    @Roles(RoleEnum.ADMIN , RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async addCompany(
        @Payload() payload: {
            companyDto: CompanyDto, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { companyDto } = payload; 
        return this.companyService.addCompany(companyDto);
    }

    @MessagePattern({ cmd: 'update_company' })
    @Roles(RoleEnum.ADMIN , RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async updateCompany(
        @Payload() payload: {
            id: string, companyDto: CompanyDto, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { id, companyDto } = payload; 
        return this.companyService.updateCompany(id, companyDto);
    }

    @MessagePattern({ cmd: 'get_companies' })
    @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getCompanies(@Payload() payload: {
            filters?: any, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { filters } = payload;
        return this.companyService.getCompanies(filters);
    }

    @MessagePattern({ cmd: 'get_company_details' })
    @Roles(RoleEnum.USER, RoleEnum.USER,RoleEnum.ADMIN , RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async getCompanyDetails(
        @Payload() payload: {
            id: string, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        return this.companyService.getCompanyDetails(payload.id);
    }
    
    @MessagePattern({ cmd: 'delete_company' })
    @Roles(RoleEnum.ADMIN , RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async deleteCompany(
        @Payload() payload: {
            id: string, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        return this.companyService.deleteCompany(payload.id);
    }
}
