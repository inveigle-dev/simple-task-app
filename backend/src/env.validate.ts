import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export class EnvVars {
  @IsEnum(Environment)
  readonly NODE_ENV: Environment = Environment.DEVELOPMENT;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly PORT: number = 3000;

  @IsString()
  readonly HOST: string = '127.0.0.1';

  @IsString()
  @IsNotEmpty()
  readonly MONGO_URI: string = '';

  @IsString()
  @IsNotEmpty()
  readonly MONGO_PASSWORD: string = '';

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET = '';

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET = '';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVars, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
