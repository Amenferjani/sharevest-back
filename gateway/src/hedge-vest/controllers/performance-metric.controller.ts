import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { PerformanceMetricService } from '../services/performance-metric.service';
import { PerformanceMetricDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth() 
@UseGuards(JwtAuthGuard)
@Controller('hedge-funds/:hedgeFundId/performance-metrics')
export class PerformanceMetricController {
    constructor(private readonly performanceMetricService: PerformanceMetricService) {}

    @Post()
    @ApiOperation({ summary: 'Create a performance metric' })
    async createPerformanceMetric(@Body() performanceMetricDto: PerformanceMetricDto, @Req() req) {
        return this.performanceMetricService.createPerformanceMetric(performanceMetricDto, req.user);
    }

    @Get('all')
    @ApiOperation({ summary: 'Get all performance metrics' })
    async getAllPerformanceMetrics(@Req() req) {
        return this.performanceMetricService.getAllPerformanceMetrics(req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get performance metrics by hedge fund ID' })
    async getMetricsByHedgeFund(@Param('hedgeFundId') hedgeFundId: string, @Req() req) {
        return this.performanceMetricService.getMetricsByHedgeFund(hedgeFundId, req.user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a performance metric' })
    async updatePerformanceMetric(@Param('id') id: string, @Body() performanceMetricDto: PerformanceMetricDto, @Req() req) {
        return this.performanceMetricService.updatePerformanceMetric(id, performanceMetricDto, req.user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a performance metric' })
    async deletePerformanceMetric(@Param('id') id: string, @Req() req) {
        return this.performanceMetricService.deletePerformanceMetric(id, req.user);
    }

    @Get('latest')
    @ApiOperation({ summary: 'Get latest performance metrics for a hedge fund' })
    async getLatestPerformanceMetrics(@Param('hedgeFundId') hedgeFundId: string, @Req() req) {
        return this.performanceMetricService.getLatestPerformanceMetrics(hedgeFundId, req.user);
    }

    @Get('report')
    @ApiOperation({ summary: 'Generate a performance report for a hedge fund' })
    async generatePerformanceReport(@Param('hedgeFundId') hedgeFundId: string, @Req() req) {
        return this.performanceMetricService.generatePerformanceReport(hedgeFundId, req.user);
    }

    @Get('track')
    @ApiOperation({ summary: 'Track performance over time for a hedge fund' })
    async trackPerformanceOverTime(
        @Param('hedgeFundId') hedgeFundId: string,
        @Req() req,
        @Body() body: { startDate?: string; endDate?: string }
    ) {
        return this.performanceMetricService.trackPerformanceOverTime(hedgeFundId, req.user, body.startDate, body.endDate);
    }
}