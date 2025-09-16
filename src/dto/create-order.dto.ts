import { IsNotEmpty, IsString, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;

  @IsString()
  @IsNotEmpty()
  trustee_id: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;

  @IsString()
  @IsNotEmpty()
  gateway_name: string;

  @IsString()
  custom_order_id?: string;
}