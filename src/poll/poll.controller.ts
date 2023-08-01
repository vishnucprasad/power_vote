import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePollDto, EditPollDto, UuidDto } from './dto';
import { PollService } from './poll.service';
import { AccessGuard } from '../user/guard';
import { UserEntity } from '../user/entity';
import { SerializeUser } from '../user/decorator';
import { Poll, Vote } from './entity';
import { DeleteResult } from 'typeorm';

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

  @Patch('edit/:id')
  editPoll(@Param() poll: UuidDto, @Body() dto: EditPollDto): Promise<Poll> {
    return this.pollService.editPoll(poll.id, dto);
  }

  @Post('cast/:id')
  castVote(
    @SerializeUser('id') userId: string,
    @Body() option: UuidDto,
    @Param() poll: UuidDto,
  ): Promise<Vote> {
    return this.pollService.castVote(userId, option.id, poll.id);
  }

  @Delete('retract/:id')
  retractVote(
    @SerializeUser() user: UserEntity,
    @Param() dto: UuidDto,
  ): Promise<DeleteResult> {
    return this.pollService.retractVote(user, dto.id);
  }
}
