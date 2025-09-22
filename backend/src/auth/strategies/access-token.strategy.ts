import { Injectable, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import type { JWTPayload } from '../jwt-payload.type';

import { UserService } from '&backend/users/user.service';

import { AppError } from '&backend/common/app-error.common';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('Missing JWT secret');

    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: JWTPayload) {
    const { sub } = payload;

    // find user using the provided token
    const user = await this.userService.getUserById(sub);

    if (!user)
      throw new AppError(
        `no user Found with the id ${sub}`,
        HttpStatus.NOT_FOUND
      );

    return user;
  }
}
