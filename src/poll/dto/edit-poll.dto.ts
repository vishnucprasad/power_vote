import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditPollDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(2)
  options?: { option: string }[];
}
