import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RefreshToken, User } from './user/entity';
import { accessTokenConfig, refreshTokenConfig } from './config';
import { PollModule } from './poll/poll.module';
import { Poll, PollOption } from './poll/entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [accessTokenConfig, refreshTokenConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: parseInt(config.get('POSTGRES_PORT')),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DATABASE'),
        entities: [User, RefreshToken, Poll, PollOption],
        synchronize: true,
      }),
    }),
    UserModule,
    PollModule,
  ],
})
export class AppModule {}
