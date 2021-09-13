import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from 'src/utils/types';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = (await this.usersService.findUserByMail(email)) as any;
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const result = {
          _id: user._id,
          email: user.email,
          isActive: user.isActive,
          displayName: user.displayName,
        };
        return result;
      }
      return null;
    }
    return null;
  }
  async generateAcessToken(payload: JwtPayLoad) {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
