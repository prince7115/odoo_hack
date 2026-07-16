import { IsOptional, IsString } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class UpdateAssetCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  customFields?: Record<string, unknown>;
}
