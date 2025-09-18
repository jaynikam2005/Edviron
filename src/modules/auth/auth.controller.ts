import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  Get,
  Req,
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
  ip?: string;
  headers?: {
    'user-agent'?: string;
  };
}

interface RefreshTokenRequest {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers?.['user-agent'];
    return await this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  async refreshToken(
    @Body() body: RefreshTokenRequest,
    @Req() req: AuthenticatedRequest,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers?.['user-agent'];
    return await this.authService.refreshToken(
      body.refreshToken,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('logout')
  async logout(@Body() body: RefreshTokenRequest) {
    return await this.authService.logout(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Request() req: AuthenticatedRequest) {
    await this.authService.revokeAllTokens(req.user._id);
    return { message: 'All tokens revoked successfully' };
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
