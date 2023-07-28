import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from 'src/config';
import { User } from '../entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    public readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.get('REFRESH_TOKEN_SECRET'),
    });
  }
  async validate(payload: Payload) {
    return this.userRepo.findOne({
      where: {
        id: payload.sub,
      },
    });
  }
}
