import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Following, FollowingSchema } from 'src/entities/following.entity';
import { MapsHelper } from 'src/helpers/maps.helper';
import { UsersModule } from '../users/users.module';
import { FollowingsController } from './controllers/followings.controller';
import { FollowingsService } from './providers/followings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Following.name,
        schema: FollowingSchema,
      },
    ]),
    forwardRef(() => UsersModule),
  ],
  providers: [FollowingsService, MapsHelper],
  controllers: [FollowingsController],
  exports: [FollowingsService],
})
export class FollowingsModule {}
