import { Module } from '@nestjs/common';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll, PollOption, Vote } from './entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollOption, Vote])],
  controllers: [PollController],
  providers: [PollService],
})
export class PollModule {}
