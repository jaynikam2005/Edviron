import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../schemas/refresh-token.schema';

interface AuthenticatedUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface TokenPayload {
  email: string;
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      const result = user.toObject() as AuthenticatedUser;
      return result;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    // Save refresh token to database
    await this.saveRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    // Update last login
    await this.userService.updateLastLogin(user._id);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const storedToken = await this.refreshTokenModel
      .findOne({
        token: refreshToken,
        is_revoked: false,
        expires_at: { $gt: new Date() },
      })
      .populate('user_id');

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne((payload as TokenPayload).sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Convert user to AuthenticatedUser
      const authenticatedUser: AuthenticatedUser = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      // Generate new tokens
      const newTokens = await this.generateTokens(authenticatedUser);

      // Revoke old refresh token
      await this.revokeRefreshToken(refreshToken, 'Token refresh');

      // Save new refresh token
      await this.saveRefreshToken(
        authenticatedUser._id,
        newTokens.refreshToken,
        ipAddress,
        userAgent,
      );

      return {
        access_token: newTokens.accessToken,
        refresh_token: newTokens.refreshToken,
      };
    } catch (error) {
      // Revoke the token if verification fails
      await this.revokeRefreshToken(refreshToken, 'Invalid token');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.revokeRefreshToken(refreshToken, 'User logout');
    return { message: 'Logged out successfully' };
  }

  async revokeAllTokens(userId: string) {
    await this.refreshTokenModel.updateMany(
      { user_id: userId, is_revoked: false },
      {
        is_revoked: true,
        revoked_at: new Date(),
        revoked_by: 'User request',
      },
    );
  }

  private async generateTokens(user: AuthenticatedUser) {
    const payload: TokenPayload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Long-lived refresh token
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = new this.refreshTokenModel({
      user_id: userId,
      token,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    await refreshToken.save();
  }

  private async revokeRefreshToken(token: string, reason: string) {
    await this.refreshTokenModel.updateOne(
      { token },
      {
        is_revoked: true,
        revoked_at: new Date(),
        revoked_by: reason,
      },
    );
  }

  async cleanupExpiredTokens() {
    await this.refreshTokenModel.deleteMany({
      $or: [
        { expires_at: { $lt: new Date() } },
        {
          is_revoked: true,
          revoked_at: {
            $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        }, // Delete revoked tokens older than 30 days
      ],
    });
  }
}
