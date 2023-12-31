import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EditUserDto, RefreshtokenDto, RegisterDto, SigninDto } from './dto';
import { UserService } from './user.service';
import { UserEntity } from './entity';
import { AccessGuard, RefreshGuard } from './guard';
import { SerializeUser } from './decorator';
import { UpdateResult } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessGuard)
  @Get()
  getUser(@SerializeUser() user: UserEntity): UserEntity {
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<UserEntity> {
    return this.userService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: SigninDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    return this.userService.signin(dto);
  }

  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(
    @SerializeUser() user: UserEntity,
    @Body() dto: RefreshtokenDto,
  ): Promise<{
    access_token: string;
  }> {
    return this.userService.refreshToken(user, dto);
  }

  @UseGuards(AccessGuard)
  @Patch('edit')
  editUser(
    @SerializeUser('id') userId: string,
    @Body() dto: EditUserDto,
  ): Promise<UpdateResult> {
    return this.userService.editUser(userId, dto);
  }

  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('signout')
  signout(@SerializeUser() user: UserEntity): Promise<void> {
    return this.userService.signout(user);
  }
}
