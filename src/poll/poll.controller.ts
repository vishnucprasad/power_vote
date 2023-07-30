import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreatePollDto } from './dto';
import { PollService } from './poll.service';
import { AccessGuard } from '../user/guard';
import { UserEntity } from '../user/entity';
import { SerializeUser } from '../user/decorator';
import { Poll } from './entity';

@UseGuards(AccessGuard)
@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Get()
  getPolls(): Promise<Poll[]> {
    return this.pollService.getPolls();
  }

  @Post('create')
  createPoll(
    @SerializeUser() user: UserEntity,
    @Body() dto: CreatePollDto,
  ): Promise<Poll> {
    return this.pollService.createPoll(user, dto);
  }
}
