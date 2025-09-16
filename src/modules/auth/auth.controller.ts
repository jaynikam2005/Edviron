import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';
import { LoginDto } from '../../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // This endpoint is protected by JWT - requires valid token
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login-guard')
  async loginWithGuard(@Request() req) {
    // This endpoint uses the LocalAuthGuard for validation
    const payload = { email: req.user.email, sub: req.user._id, role: req.user.role };
    return {
      access_token: this.authService['jwtService'].sign(payload),
      user: req.user,
    };
  }
}