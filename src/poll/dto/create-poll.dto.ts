import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ArrayMinSize(1)
  options: { option: string }[];
}
