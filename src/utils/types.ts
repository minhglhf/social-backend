import { Types } from 'mongoose';

export class JwtPayLoad {
  userId: Types.ObjectId;
  isActive: boolean;
}
