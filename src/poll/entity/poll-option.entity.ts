import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Poll } from './poll.entity';

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  option: string;

  @Column({ default: 0 })
  votes: number;

  @ManyToOne(() => Poll, (poll) => poll.options)
  poll: Poll;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
