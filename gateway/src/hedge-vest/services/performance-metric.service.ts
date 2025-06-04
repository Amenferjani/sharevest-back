import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PerformanceMetricDto } from '@amenferjani/shared-lib';

@Injectable()
export class PerformanceMetricService {
    constructor(
        @Inject('HEDGE_VEST_SERVICE') private readonly client: ClientProxy,
    ) {}

    async createPerformanceMetric(
        performanceMetricDto: PerformanceMetricDto,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd : 'create-performance-metric'}, { performanceMetricDto, user }).toPromise();
    }

    async getAllPerformanceMetrics(
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd : 'get-all-performance-metrics'}, { user }).toPromise();
    }

    async getMetricsByHedgeFund(
        hedgeFundId: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd : 'get-metrics-by-hedge-fund'}, { hedgeFundId, user }).toPromise();
    }

    async updatePerformanceMetric(
        id: string,
        performanceMetricDto: PerformanceMetricDto,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd : 'update-performance-metric'}, { id, performanceMetricDto, user }).toPromise();
    }

    async deletePerformanceMetric(
        id: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'delete-performance-metric'}, { id, user }).toPromise();
    }

    async getLatestPerformanceMetrics(
        hedgeFundId: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'get-latest-performance-metrics'}, { hedgeFundId, user }).toPromise();
    }

    async generatePerformanceReport(
        hedgeFundId: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
    ) {
        return this.client.send({cmd :'generate-performance-report'}, { hedgeFundId, user }).toPromise();
    }

    async trackPerformanceOverTime(
        hedgeFundId: string,
        user: { userId: string; email: string; roles: { id: string; name: string } },
        startDate?: string,
        endDate?: string
    ) {
        return this.client.send({cmd :'track-performance-over-time'}, { hedgeFundId, user, startDate, endDate }).toPromise();
    }
}
