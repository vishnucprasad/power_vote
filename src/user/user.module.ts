import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, User } from './entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.register({}),
    PassportModule.register({
      session: false,
    }),
  ],
  providers: [UserService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [UserController],
})
export class UserModule {}
