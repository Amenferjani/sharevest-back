import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { EventService } from '../services/event.service';
import { EventDto } from '@amenferjani/shared-lib';
import { JwtAuthGuard } from '@amenferjani/shared-lib';

@Controller('rel-vest/events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async addEvent(@Req() req, @Body() eventDto: EventDto) {
        const user = req.user;
        return this.eventService.addEvent(eventDto, user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateEvent(@Req() req, @Param('id') id: string, @Body() eventDto: EventDto) {
        const user = req.user;
        return this.eventService.updateEvent(id, eventDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteEvent(@Req() req, @Param('id') id: string) {
        const user = req.user;
        return this.eventService.deleteEvent(id, user);
    }

    @Get('company/:companyId')
    @UseGuards(JwtAuthGuard)
    async getEventsByCompany(@Req() req, @Param('companyId') companyId: string) {
        const user = req.user;
        return this.eventService.getEventsByCompany(companyId, user);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getEventDetails(@Req() req, @Param('id') id: string) {
        const user = req.user;
        return this.eventService.getEventDetails(id, user);
    }

    @Get(':id/investors')
    @UseGuards(JwtAuthGuard)
    async getEventInvestors(@Req() req, @Param('id') id: string) {
        const user = req.user;
        return this.eventService.getEventInvestors(id, user);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard)
    async updateEventStatus(@Req() req, @Param('id') id: string, @Body() body: { status: 'upcoming' | 'completed' | 'cancelled' }) {
        const user = req.user;
        return this.eventService.updateEventStatus(id, body.status, user);
    }

    @Post(':eventId/rsvp')
    @UseGuards(JwtAuthGuard)
    async rsvpToEvent(@Req() req, @Param('eventId') eventId: string, @Body() body: { investorId: string }) {
        const user = req.user;
        return this.eventService.rsvpToEvent(body.investorId, eventId, user);
    }

    @Delete(':eventId/rsvp/:investorId')
    @UseGuards(JwtAuthGuard)
    async cancelRsvp(@Req() req, @Param('eventId') eventId: string, @Param('investorId') investorId: string) {
        const user = req.user;
        return this.eventService.cancelRsvp(investorId, eventId, user);
    }
}
