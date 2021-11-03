import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Activation, ActivationSchema } from 'src/entities/activation.entity';
import {
  PasswordReset,
  PasswordResetSchema,
} from 'src/entities/passwordReset.entity';
import { User, UserSchema } from 'src/entities/user.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { StringHandlersHelper } from 'src/helpers/stringHandler.helper';

import { MailModule } from 'src/mail/mai.module';
import { UploadsModule } from 'src/uploads/uploads.module';
import { AddressesModule } from '../addresses/addresses.module';
import { FollowingsModule } from '../followings/followings.module';
import { GroupsModule } from '../groups/groups.module';
import { UsersAuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { UsersAuthService } from './providers/auth.service';
import { UsersService } from './providers/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Activation.name,
        schema: ActivationSchema,
      },
      {
        name: PasswordReset.name,
        schema: PasswordResetSchema,
      },
    ]),
    forwardRef(() => AuthModule),
    MailModule,
    AddressesModule,
    UploadsModule,
    forwardRef(() => FollowingsModule),
    GroupsModule
  ],
  controllers: [UsersAuthController, UsersController],
  providers: [UsersService, UsersAuthService, StringHandlersHelper, MapsHelper],
  exports: [UsersService, UsersAuthService],
})
export class UsersModule { }
