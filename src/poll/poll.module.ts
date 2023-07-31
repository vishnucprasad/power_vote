import { Module } from '@nestjs/common';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll, PollOption, Vote } from './entity';
import { User } from '../user/entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Poll, PollOption, Vote])],
  controllers: [PollController],
  providers: [PollService],
})
export class PollModule {}
