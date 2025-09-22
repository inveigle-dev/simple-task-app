import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '&backend/users/user.schema';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): Partial<User> => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  }
);
