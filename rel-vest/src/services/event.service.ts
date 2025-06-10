import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventDto } from '@amenferjani/shared-lib';
import { Investor } from '@amenferjani/shared-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Event } from '@amenferjani/shared-lib';
import { InvestorService } from './investor.service';

@Injectable()
export class EventService {
    constructor(
        private readonly investorService: InvestorService,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) { }

    async addEvent(eventDto: EventDto): Promise<Event> {
        const event = this.eventRepository.create(eventDto);
        return this.eventRepository.save(event);
    }

    async updateEvent(id: string, eventDto: EventDto): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        await this.eventRepository.update(id, eventDto);
        return this.eventRepository.findOne({ where: { id } });
    }

    async deleteEvent(id: string): Promise<void> {
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Event not found');
        }
    }

    async getEventsByCompany(companyId: string): Promise<Event[]> {
        return this.eventRepository.find({ where: { company: { id: companyId } } });
    }

    async getEventDetails(id: string): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id },relations : ['company','investors'] });
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event;
    }

    async getInvestorsByEvent(eventId: string): Promise<Investor[]> {
        const event = await this.eventRepository.findOne({ where: { id: eventId }});
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event.investors;
    }

    async updateEventStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        event.status = status;
        return this.eventRepository.save(event);
    }

    async rsvpToEvent(userId: string, eventId: string): Promise<void> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations:['investors']
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const investor = await this.investorService.getInvestorById(userId);
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        if (event.investors.some((inv) => inv.id === investor.id)) {
            throw new BadRequestException('Investor has already RSVP for this event');
        }

        event.investors.push(investor); 
        await this.eventRepository.save(event);
    }

    async cancelRsvp(userId: string, eventId: string): Promise<void> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['investors']
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const investor = await this.investorService.getInvestorById(userId);
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        const investorIndex = event.investors.findIndex((inv) => inv.id === investor.id);
        if (investorIndex === -1) {
            throw new NotFoundException('Investor has not RSVP for this event');
        }

        event.investors.splice(investorIndex, 1);
        await this.eventRepository.save(event);
    }

    async getUpcomingEventsForInvestor(userId: string) {
        const investor = await this.investorService.getInvestorById(userId);
        if (!investor) {
            throw new NotFoundException('Investor not found');
        }

        const companyIds = investor.companies.map((c) => c.id);

        return this.eventRepository.find({
            where: {
                companyId: In(companyIds),
                status: 'upcoming',
            },
            relations: ['company'],
            order: { date: 'ASC' },
        });
    }
}
