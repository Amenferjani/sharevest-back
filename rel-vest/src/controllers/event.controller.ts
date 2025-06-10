import { Controller, Body, Param, UseGuards } from '@nestjs/common';
import { EventService } from '../services/event.service';
import { EventDto, RoleEnum, Roles, RolesGuard } from '@amenferjani/shared-lib';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class EventController {
    constructor(
        private readonly eventService: EventService,
    ) { }

    @MessagePattern({ cmd: 'add_event' })
    @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async addEvent(@Payload() payload: {
        eventDto: EventDto, 
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { eventDto } = payload;
        const event = await this.eventService.addEvent(eventDto);
        // Optionally, notify investors for the event if needed
        // this.companyService.notifyInvestorsForEvent(event);
        return event;
    }

    @MessagePattern({ cmd: 'update_event' })
    @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async updateEvent(
        @Payload() payload: {
            id: string, eventDto: EventDto, 
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { id, eventDto } = payload;
        return this.eventService.updateEvent(id, eventDto);
    }

    @MessagePattern({ cmd: 'delete_event' })
    @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async deleteEvent(@Payload() payload: {
        id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { id } = payload;
        return this.eventService.deleteEvent(id);
    }

    @MessagePattern({ cmd: 'get_events_by_company' })
    @Roles(RoleEnum.USER,RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async getEventsByCompany(@Payload() payload: {
        companyId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { companyId } = payload;
        return this.eventService.getEventsByCompany(companyId);
    }

    @MessagePattern({ cmd: 'get_event_details' })
    @Roles(RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async getEventDetails(@Payload() payload: {
        id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { id } = payload;
        return this.eventService.getEventDetails(id);
    }

    @MessagePattern({ cmd: 'get_event_investors' })
    @Roles(RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async getEventInvestors(@Payload() payload: {
        id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }
    }) {
        const { id } = payload;
        return this.eventService.getInvestorsByEvent(id);
    }

    @MessagePattern({ cmd: 'update_event_status' })
    @Roles(RoleEnum.ADMIN, RoleEnum.COMPANY_REPRESENTATIVE)
    @UseGuards(RolesGuard)
    async updateEventStatus(
        @Payload() payload: {
            id: string,
            status: 'upcoming' | 'completed' | 'cancelled',
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { id, status } = payload;
        return this.eventService.updateEventStatus(id, status);
    }

    @MessagePattern({ cmd: 'rsvp_to_event' })
    @Roles(RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async rsvpToEvent(@Payload() payload: {
            eventId: string,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { user, eventId } = payload;
        return this.eventService.rsvpToEvent(user.userId, eventId);
    }

    @MessagePattern({ cmd: 'cancel_rsvp' })
    @Roles(RoleEnum.PREMIUM_USER, RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async cancelRsvp(@Payload() payload: {
            eventId: string,
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { user, eventId } = payload;
        return this.eventService.cancelRsvp(user.userId, eventId);
    }

    @MessagePattern({ cmd: 'getUpcomingEventsForInvestor' })
    @Roles( RoleEnum.USER, RoleEnum.ADMIN)
    @UseGuards(RolesGuard)
    async getUpcomingEventsForInvestor (@Payload() payload: {
            user: { userId: string, email: string, roles: { id: string, name: string } }
        }
    ) {
        const { user } = payload;
        return this.eventService.getUpcomingEventsForInvestor(user.userId);
    }
}
