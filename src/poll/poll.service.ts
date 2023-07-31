import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll, PollOption, Vote } from './entity';
import { Repository } from 'typeorm';
import { User, UserEntity } from '../user/entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepo: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly pollOptionRepo: Repository<PollOption>,
    @InjectRepository(Vote)
    private readonly voteRepo: Repository<Vote>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  public async castVote(userId: string, optionId: string, pollId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { votes: { pollOption: { poll: true } } },
    });

    const hasVoted = user.votes.some(
      (vote) => vote.pollOption.poll.id === pollId,
    );

    if (hasVoted) {
      throw new ForbiddenException(
        'Oops! You have already voted for this poll',
      );
    }

    const pollOption = await this.pollOptionRepo.findOneBy({ id: optionId });

    return await this.voteRepo.save({
      pollOption,
      votedBy: user,
    });
  }
}
