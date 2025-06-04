import { Controller, UseGuards } from '@nestjs/common';
import { InvestorService } from '../services/investor.service';
import { InvestorDto, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InvestorController {
    constructor(
        private readonly investorService: InvestorService,
    ) { }

    @MessagePattern({ cmd: 'addInvestor' })
    @Roles(RoleEnum.ADMIN, RoleEnum.USER,RoleEnum.PREMIUM_USER)
    @UseGuards(RolesGuard)
    async addInvestor(
        @Payload() payload: {
            investorDto: InvestorDto,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { investorDto } = payload;
        return this.investorService.addInvestor({...investorDto , userId : payload.user.userId});
    }

    @MessagePattern({ cmd: 'updateInvestor' })
    @Roles(RoleEnum.ADMIN, RoleEnum.REL_INVESTOR)
    @UseGuards(RolesGuard)
    async updateInvestor(
        @Payload() payload: {
            id: string, investorDto: InvestorDto,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { investorDto ,id} = payload;
        return this.investorService.updateInvestor(id, investorDto);
    }
    
    @MessagePattern({ cmd: 'removeInvestor' })
    @Roles(RoleEnum.ADMIN, RoleEnum.REL_INVESTOR, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async removeInvestor(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { id} = payload;
        return this.investorService.removeInvestor(id);
    }

    @MessagePattern({ cmd: 'getInvestors' })
    @Roles(RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getInvestors(@Payload() payload: {
        filters: any,
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { filters } = payload;
        return this.investorService.getInvestors(filters);
    }

    @MessagePattern({ cmd: 'getInvestorById' })
    @Roles(RoleEnum.USER)
    @UseGuards(RolesGuard)
    async getInvestorById(@Payload() payload: {
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        return this.investorService.getInvestorById(payload.user.userId);
    }

    @MessagePattern({ cmd: 'linkInvestorToCompany' })
    @Roles(RoleEnum.USER)
    @UseGuards(RolesGuard)
    async linkInvestorToCompany(
        @Payload() payload: { companyId: string, user: { userId: string, email: string, roles: { id: string, name: string } } }
    ) {
        const { user, companyId } = payload;
        return this.investorService.linkInvestorToCompany(user.userId, companyId);
    }

    @MessagePattern({ cmd: 'unlinkInvestorFromCompany' })
    @Roles(RoleEnum.REL_INVESTOR, RoleEnum.USER)
    @UseGuards(RolesGuard)
    async unlinkInvestorFromCompany(@Payload() payload: {
        companyId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { companyId,user } = payload;
        return this.investorService.unlinkInvestorFromCompany(user.userId,companyId);
    }

    // @MessagePattern({ cmd: 'getInvestorsByCompany' })
    // @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    // @UseGuards(RolesGuard)
    // async getInvestorsByCompany(@Payload() payload: {
    //     companyId: string,
    //     user: { userId: string, email: string, roles: { id: string, name: string } }
    // }) {
    //     const { companyId } = payload;
    //     return this.investorService.getInvestorsByCompany(companyId);
    // }
}