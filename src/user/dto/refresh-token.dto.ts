import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshtokenDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;
}
