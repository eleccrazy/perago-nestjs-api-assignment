import {
  IsNotEmpty,
  IsUUID,
  ValidateIf,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly description: string;
  @IsOptional()
  @IsUUID('all', { message: 'Parent Position Not Found!' })
  @ValidateIf((object, value) => value !== undefined)
  readonly parentId?: string;
}

export class UpdatePositionDto {
  @IsOptional()
  readonly name?: string;
  @IsOptional()
  readonly description?: string;
  @IsOptional()
  @IsUUID('all', { message: 'Parent Position Not Found!' })
  @ValidateIf((object, value) => value !== undefined)
  readonly parentId?: string;
}
