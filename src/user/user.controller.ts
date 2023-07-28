import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto, SigninDto } from './dto';
import { UserService } from './user.service';
import { UserEntity } from './entity';
import { AccessGuard } from './guard';
import { SerializeUser } from './decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessGuard)
  @Get()
  getUser(@SerializeUser() user: UserEntity) {
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
}
