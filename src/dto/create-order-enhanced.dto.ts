import {
  IsString,
  IsEmail,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class StudentInfoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  class?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  section?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'school_id must contain only alphanumeric characters, hyphens, and underscores',
  })
  school_id: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'trustee_id must contain only alphanumeric characters, hyphens, and underscores',
  })
  trustee_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 50)
  gateway_name: string;
}