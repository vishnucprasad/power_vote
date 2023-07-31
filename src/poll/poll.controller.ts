import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreatePollDto, UuidDto } from './dto';
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

  @Get(':id')
  getPollById(@Param() dto: UuidDto): Promise<Poll> {
    return this.pollService.getPollById(dto.id);
  }

  @Post('create')
  createPoll(
    @SerializeUser() user: UserEntity,
    @Body() dto: CreatePollDto,
  ): Promise<Poll> {
    return this.pollService.createPoll(user, dto);
  }

  @Post('cast/:id')
  castVote(
    @SerializeUser('id') userId: string,
    @Body() option: UuidDto,
    @Param() poll: UuidDto,
  ) {
    return this.pollService.castVote(userId, option.id, poll.id);
  }
}
