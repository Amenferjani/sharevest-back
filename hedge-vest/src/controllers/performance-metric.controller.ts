import { Controller,UseGuards } from '@nestjs/common';
import {  MessagePattern, Payload } from '@nestjs/microservices';
import { PerformanceMetricService } from '../services/performance-metric.service';
import { PerformanceMetricDto,RolesGuard,Roles,RoleEnum } from '@amenferjani/shared-lib';

@Controller()
export class PerformanceMetricController {
    constructor(private readonly performanceMetricService: PerformanceMetricService) {}

    @MessagePattern({cmd : 'create-performance-metric'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async createPerformanceMetric(@Payload() payload: {
        performanceMetricDto: PerformanceMetricDto,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { performanceMetricDto } = payload;
        return this.performanceMetricService.createPerformanceMetric(performanceMetricDto);
    }

    @MessagePattern({cmd:'get-all-performance-metrics'})
    @Roles(RoleEnum.ADMIN)
    @UseGuards( RolesGuard)
    async getAllPerformanceMetrics(@Payload() payload: {
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        return this.performanceMetricService.getAllPerformanceMetrics();
    }

    @MessagePattern({cmd:'get-metrics-by-hedge-fund'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async getMetricsByHedgeFund(@Payload() payload: {
        hedgeFundId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { hedgeFundId } = payload;
        return this.performanceMetricService.getMetricsByHedgeFund(hedgeFundId);
    }

    @MessagePattern({cmd:'update-performance-metric'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async updatePerformanceMetric(
        @Payload() payload: {
            id: string,
            user: { userId: string, email: string, roles: { id: string, name: string } },
            performanceMetricDto: PerformanceMetricDto
        },
    ) {
        return this.performanceMetricService.updatePerformanceMetric(payload.id, payload.performanceMetricDto);
    }

    @MessagePattern({cmd:'delete-performance-metric'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async deletePerformanceMetric(@Payload() payload: {
        id: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { id } = payload;
        return this.performanceMetricService.deletePerformanceMetric(id);
    }

    @MessagePattern({cmd:'get-latest-performance-metrics'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async getLatestPerformanceMetrics(@Payload() payload: {
        hedgeFundId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { hedgeFundId } = payload;
        return this.performanceMetricService.getLatestPerformanceMetrics(hedgeFundId);
    }

    @MessagePattern({ cmd: 'generate-performance-report'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async generatePerformanceReport(@Payload() Payload: {
        hedgeFundId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
    }) {
        const { hedgeFundId } = Payload;
        return this.performanceMetricService.generatePerformanceReport(hedgeFundId);
    }

    @MessagePattern({cmd:'track-performance-over-time'})
    @Roles(RoleEnum.ADMIN,RoleEnum.FUND_MANAGER)
    @UseGuards( RolesGuard)
    async trackPerformanceOverTime(@Payload() payload: {
        hedgeFundId: string,
        user: { userId: string, email: string, roles: { id: string, name: string } },
        startDate?: string,
        endDate?: string
    }) {
        const start = payload.startDate ? new Date(payload.startDate) : undefined;
        const end = payload.endDate ? new Date(payload.endDate) : undefined;
        return this.performanceMetricService.trackPerformanceOverTime(payload.hedgeFundId, start, end);
    }
}
