import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll, PollOption } from './entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepo: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly pollOptionRepo: Repository<PollOption>,
  ) {}

  public async getPolls(): Promise<Poll[]> {
    return await this.pollRepo.find({
      relations: {
        options: {
          votes: true,
        },
      },
    });
  }

  public async getPollById(pollId: string): Promise<Poll> {
    return await this.pollRepo.findOne({
      where: {
        id: pollId,
      },
      relations: {
        options: {
          votes: true,
        },
      },
    });
  }

  public async createPoll(user: UserEntity, dto: CreatePollDto): Promise<Poll> {
    const pollOptions = await this.pollOptionRepo.save(dto.options);

    return await this.pollRepo.save({
      question: dto.question,
      options: pollOptions,
      createdBy: user,
    });
  }
}
