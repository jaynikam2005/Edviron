import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';
import { LoginDto } from '../../dto/login.dto';

interface AuthenticatedRequest {
  user: {
    email: string;
    _id: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    // This endpoint is protected by JWT - requires valid token
    return {
      message: 'This is a protected route',
      user: req.user,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login-guard')
  loginWithGuard(@Request() req: AuthenticatedRequest) {
    // This endpoint uses the LocalAuthGuard for validation
    const payload = {
      email: req.user.email,
      sub: req.user._id,
      role: req.user.role,
    };
    return {
      access_token: this.authService['jwtService'].sign(payload),
      user: req.user,
    };
  }
}
