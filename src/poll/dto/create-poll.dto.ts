import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsNotEmpty()
  options: [{ option: string }];
}
