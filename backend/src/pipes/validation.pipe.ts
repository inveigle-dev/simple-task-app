import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  Type,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

import { ValidationException } from '&backend/filters/validation-exception.filter';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);

    try {
      await validateOrReject(object);
    } catch (error) {
      throw new ValidationException(error as ValidationError[]);
    }

    return value;
  }

  private toValidate(metaType: Type<unknown>): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metaType === type);
  }
}
