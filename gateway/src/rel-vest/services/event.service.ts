import { Inject,Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventDto } from '@amenferjani/shared-lib';

@Injectable()
export class EventService {
    constructor(
        @Inject('REL_VEST_SERVICE') private readonly client: ClientProxy,
    ) { }

    async addEvent(eventDto: EventDto, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'add_event' }, { eventDto, user }).toPromise();
    }

    async updateEvent(id: string, eventDto: EventDto, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'update_event' }, { id, eventDto, user }).toPromise();
    }

    async deleteEvent(id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'delete_event' }, { id, user }).toPromise();
    }

    async getEventsByCompany(companyId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'get_events_by_company' }, { companyId, user }).toPromise();
    }

    async getEventDetails(id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'get_event_details' }, { id, user }).toPromise();
    }

    async getEventInvestors(id: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'get_event_investors' }, { id, user }).toPromise();
    }

    async updateEventStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled', 
    user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'update_event_status' }, { id, status, user }).toPromise();
    }

    async rsvpToEvent(eventId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'rsvp_to_event' }, { eventId, user }).toPromise();
    }

    async cancelRsvp(eventId: string, 
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'cancel_rsvp' }, { eventId, user }).toPromise();
    }

    async getUpcomingEventsForInvestor(
        user: { userId: string, email: string, roles: { id: string, name: string } }) {
        return this.client.send({ cmd: 'getUpcomingEventsForInvestor' }, { user }).toPromise();
    }
}
