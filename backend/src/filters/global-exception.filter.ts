import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { JsonWebTokenError } from '@nestjs/jwt';

import { Environment } from '&backend/env.validate';
import { ValidationException } from '&backend/filters/validation-exception.filter';

import { AppError } from '&backend/common/app-error.common';
import { ErrorMessage } from '&backend/common/error-messages.enum';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost): Response<JSON> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;

    let message: { [key: string]: unknown } | string =
      ErrorMessage.CUSTOM_SERVER_ERROR;

    let data: unknown;

    if (err instanceof AppError) {
      ({ message } = err);
    }

    if (typeof err.message === 'string') {
      ({ message } = err);
    }

    if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
      data = {
        message: err.message,
        stack: err.stack,
      };
    }

    if (err instanceof ValidationException) {
      if (err.errors instanceof Array) {
        data = err.errors.map((err: ValidationError) => ({
          property: err.property,
          constraints: err.constraints ? Object.values(err.constraints) : [],
        }));
      } else data = err.getResponse();
    }

    if (err instanceof JsonWebTokenError) {
      status = HttpStatus.UNAUTHORIZED;
    }

    return res.status(status).json({
      status,
      message,
      data,
    });
  }
}
