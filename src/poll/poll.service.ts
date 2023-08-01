import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePollDto, EditPollDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll, PollOption, Vote } from './entity';
import { DeleteResult, Repository } from 'typeorm';
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

  public async editPoll(pollId: string, dto: EditPollDto): Promise<Poll> {
    const poll = await this.pollRepo.findOne({
      where: { id: pollId },
      relations: { options: true },
    });

    if (dto.options) {
      const promises = [];
      for (let option of poll.options) {
        promises.push(this.pollOptionRepo.delete({ id: option.id }));
      }

      await Promise.all(promises);
      const options = await this.pollOptionRepo.save(dto.options);
      poll.options = options;
    }

    if (dto.question) poll.question = dto.question;

    return await this.pollRepo.save(poll);
  }

  public async castVote(
    userId: string,
    optionId: string,
    pollId: string,
  ): Promise<Vote> {
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

  public async retractVote(
    user: UserEntity,
    optionId: string,
  ): Promise<DeleteResult> {
    const pollOption = await this.pollOptionRepo.findOneBy({ id: optionId });

    return await this.voteRepo.delete({
      pollOption: pollOption,
      votedBy: user,
    });
  }

  public async deletePoll(
    user: UserEntity,
    pollId: string,
  ): Promise<DeleteResult> {
    const poll = await this.pollRepo.findOne({
      where: { id: pollId },
      relations: {
        createdBy: true,
        options: true,
      },
    });

    if (poll.createdBy.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const promises = [];
    for (let option of poll.options) {
      promises.push(this.pollOptionRepo.delete({ id: option.id }));
    }

    await Promise.all(promises);
    return await this.pollRepo.delete({ id: poll.id });
  }
}
