import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreatePollDto } from './dto';
import { PollService } from './poll.service';
import { AccessGuard } from '../user/guard';
import { UserEntity } from '../user/entity';
import { SerializeUser } from '../user/decorator';
import { Poll } from './entity';

@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @UseGuards(AccessGuard)
  @Post('create')
  createPoll(
    @SerializeUser() user: UserEntity,
    @Body() dto: CreatePollDto,
  ): Promise<Poll> {
    return this.pollService.createPoll(user, dto);
  }
}
