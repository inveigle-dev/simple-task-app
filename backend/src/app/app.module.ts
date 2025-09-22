import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ValidationPipe } from '&backend/pipes/validation.pipe';
import { GlobalExceptionsFilter } from '&backend/filters/global-exception.filter';
import { ResponseInterceptor } from '&backend/interceptors/response.interceptor';

import { validate } from '&backend/env.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '&backend/auth/auth.module';
import { UsersModule } from '&backend/users/users.module';
import { TasksModule } from '&backend/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const mongoUri = config.get<string>('MONGO_URI');
        const mongoPassword = config.get<string>('MONGO_PASSWORD');
        if (!mongoUri || !mongoPassword) {
          throw new Error(
            'App cannot start due to missing environment variables'
          );
        }

        const uri = mongoUri.replace('<db_password>', mongoPassword);
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    JwtService,
  ],
})
export class AppModule {}
