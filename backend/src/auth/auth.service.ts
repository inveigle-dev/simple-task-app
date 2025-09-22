import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User } from '&backend/users/user.schema';
import { ErrorMessage } from '&backend/common/error-messages.enum';
import { AppError } from '&backend/common/app-error.common';

import { JWTPayload } from './jwt-payload.type';
import { AuthDTO } from './dto/auth.dto';
import { RegistrationDTO } from './dto/registration.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  private async generateTokens(auth: JWTPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(auth, {
        expiresIn: 60 * 60 * 24,
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(auth, {
        // Access token will expire in 1week
        expiresIn: 60 * 60 * 24 * 7,
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(id: string) {
    const user = await this.userModel.findOne({ _id: id });

    if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

    const tokens = await this.generateTokens({
      sub: user.id,
      roles: [...user.roles],
    });

    return { tokens };
  }

  async login(authDTO: AuthDTO) {
    const { email, password } = authDTO;

    const doc = await this.userModel.findOne({ email }).select('+password');

    if (!doc) throw new AppError('No user found!', HttpStatus.NOT_FOUND);

    const user = doc.toObject();

    if (user && (await bcrypt.compare(password, user.password))) {
      // 2) RETURN THE USER IF FOUND AND ADD THE TOKEN TO THE REQUEST BODY
      const tokens = await this.generateTokens({
        sub: user._id.toString(),
        roles: [...user.roles],
      });

      return {
        user: {
          email: user.email,
          role: [...user.roles],
          id: user._id.toString(),
        },
        tokens,
      };
    }

    throw new AppError(
      ErrorMessage.INVALID_LOGIN_CREDENTIALS,
      HttpStatus.BAD_REQUEST
    );
  }

  async register(registrationDTO: RegistrationDTO) {
    const { email } = registrationDTO;

    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new AppError('Email already exists!.', HttpStatus.CONFLICT);
    }

    const SALT = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(registrationDTO.password, SALT);

    const user = await this.userModel.create({
      email: registrationDTO.email,
      password: hashedPassword,
    });

    await user.save();

    return {
      message: 'Account created successfully',
    };
  }
}
