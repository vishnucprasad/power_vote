import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User, UserEntity } from './entity';
import { RegisterDto, SigninDto } from './dto';
import {
  JwtConfig,
  Payload,
  accessTokenConfig,
  refreshTokenConfig,
} from '../config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto): Promise<UserEntity> {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.userRepo.save({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        hash: hash,
      });

      return new UserEntity(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ForbiddenException(`Email ${dto.email} is already in use`);
      }

      throw error;
    }
  }

  public async signin(dto: SigninDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        hash: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid password');

    const payload: Payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.generateJWT(payload, accessTokenConfig());
    const refreshToken = this.generateJWT(payload, refreshTokenConfig());

    const doc = await this.refreshTokenRepo.findOne({ where: { user } });

    if (doc) {
      await this.refreshTokenRepo.update({ user }, { token: refreshToken });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }

    await this.refreshTokenRepo.save({
      token: refreshToken,
      user,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  public generateJWT(payload: Payload, config: JwtConfig): string {
    return this.jwtService.sign(payload, {
      secret: config.secret,
      expiresIn: config.expiresIn,
    });
  }
}
