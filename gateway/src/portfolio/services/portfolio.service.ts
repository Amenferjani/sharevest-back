import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Portfolio, PortfolioDto } from '@amenferjani/shared-lib';

@Injectable()
export class PortfolioService {
    constructor(
        @Inject('PORTFOLIO_SERVICE') private readonly client: ClientProxy
    ) { }

    async createPortfolio(portfolioDto: PortfolioDto ,user:any): Promise<Portfolio> {
        return this.client.send({ cmd: 'create_portfolio' }, {portfolioDto,user}).toPromise();
    }

    async getPortfolioById(id: string,user:any): Promise<Portfolio> {
        return this.client.send({ cmd: 'get_portfolio_by_id' }, { id,user }).toPromise();
    }

    async getPortfoliosByUser(user:any): Promise<Portfolio[]> {
        return this.client.send({ cmd: 'get_portfolios_by_user' }, { user}).toPromise();
    }

    async updatePortfolio(id: string, portfolioDto: PortfolioDto): Promise<Portfolio> {
        return this.client.send({ cmd: 'update_portfolio' }, { id, portfolioDto }).toPromise();
    }

    async deletePortfolio(id: string): Promise<void> {
        return this.client.send({ cmd: 'delete_portfolio' }, { id }).toPromise();
    }

    async getPortfolioDetails(id: string): Promise<any> {
        return this.client.send({ cmd: 'get_portfolio_details' }, { id }).toPromise();
    }
}
