import { Injectable, Inject, NotFoundException, InternalServerErrorException, HttpStatus, HttpException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RiskProfileDto } from '@amenferjani/shared-lib';

@Injectable()
export class RiskService {
    constructor(
        @Inject('RISK_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async createRiskProfile(riskDto: RiskProfileDto,
    user: { userId: string, email: string, roles: { id: string, name: string } }
    ) {
        return this.client.send('create_risk_profile',{ riskDto , user}).toPromise();
    }

    async findAllRiskProfiles(
        user: { userId: string, email: string, roles: { id: string, name: string } }
    ) {
        return this.client.send('find-all-risk-profiles', {user}).toPromise();
    }

    async findRiskProfileById(id: string
    , user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send('find-risk-profile-by-id', {id,user}).toPromise();
    }

    async deleteRiskProfile(id: string
    , user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send('delete-risk-profile', {id,user}).toPromise();
    }

    async getUserRiskProfile(user: { userId: string }) {
    try {
        console.log("risk http service try ")
        return await this.client
            .send('get-user-risk-profile', { user })
            .toPromise();
    } catch (err) {
        console.error('risk http service catch ', err);

            const status = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = err.message || 'Failed to fetch risk profile';

            if (status === HttpStatus.NOT_FOUND) {
                throw new NotFoundException(message);
            }

            throw new InternalServerErrorException(message);
        }
    }

    async updateRiskProfileByUserId(updatedRiskProfileDto: RiskProfileDto,
        user: { userId: string, email: string, roles: { id: string, name: string } }
    ) {
        return this.client.send('update-risk-profile-by-user-id', { user, updatedRiskProfileDto }).toPromise();
    }

    async suggestRiskProfileChange(user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send('suggest-risk-profile-change', { user}).toPromise();
    }

    async getAggregatedRiskDetails(
        user: { userId: string, email: string, roles: { id: string, name: string } }
    ) {
        return this.client.send('get-aggregated-risk-details', { user }).toPromise();
    }

    async getAdjustedCrowdfundingRiskForUser(
        user: { userId: string, email: string, roles: { id: string, name: string } }
    ) {
        try {
            return this.client.send('get-adjusted-crowdfunding-risk-for-user', { user }).toPromise();
        } catch (error) {
            console.log(error)
            throw new RpcException(error)
        }
    }
}