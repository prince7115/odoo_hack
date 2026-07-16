import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentDepartmentId?: string;

  @IsOptional()
  @IsString()
  headId?: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentDepartmentId?: string;

  @IsOptional()
  @IsString()
  headId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
