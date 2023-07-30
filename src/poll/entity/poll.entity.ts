import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PollOption } from './poll-option.entity';
import { User } from '../../user/entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options: PollOption[];

  @OneToOne((type) => User)
  @JoinColumn()
  createdBy: User;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
