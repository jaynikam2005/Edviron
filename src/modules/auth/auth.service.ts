import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    // Update last login
    await this.userService.updateLastLogin(user._id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
