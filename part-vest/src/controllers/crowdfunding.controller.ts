import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CrowdfundingService } from 'src/services/crowdfunding.service';

@Controller()
export class CrowdfundingController {
    constructor(private readonly crowdfundingService: CrowdfundingService) {}

    @MessagePattern({ cmd: 'check_health' })
    checkHealth(): string {
        return this.crowdfundingService.checkHealth();
    }

    @MessagePattern({ cmd: 'get_risk' })
    async getRisk(@Payload() data: { userId: string }): Promise<Array<{ title: string; risk: number }>> {
        return this.crowdfundingService.getDetails(data.userId);
    }
}
