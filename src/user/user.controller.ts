import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto, SigninDto } from './dto';
import { UserService } from './user.service';
import { UserEntity } from './entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
