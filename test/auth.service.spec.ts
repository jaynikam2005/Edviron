import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserService } from '../src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from '../src/schemas/refresh-token.schema';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let refreshTokenModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    password: 'hashedPassword',
    toObject: () => ({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    }),
  };

  const mockRefreshTokenModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    save: jest.fn(),
  };

  const mockRefreshTokenConstructor = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            findOne: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenConstructor,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenModel = module.get(getModelToken(RefreshToken.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
      });
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'validatePassword').mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and user data on successful login', async () => {
      jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(mockUser.toObject());
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      const mockSave = jest.fn().mockResolvedValue({});
      mockRefreshTokenConstructor.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token';
    const mockStoredToken = {
      token: validRefreshToken,
      user_id: '507f1f77bcf86cd799439011',
      is_revoked: false,
      expires_at: new Date(Date.now() + 86400000), // 1 day from now
    };

    it('should return new tokens for valid refresh token', async () => {
      mockRefreshTokenModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockStoredToken),
      });
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        sub: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'user',
      });
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser as any);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(validRefreshToken);

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockRefreshTokenModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token successfully', async () => {
      mockRefreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.logout('refresh-token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockRefreshTokenModel.updateOne).toHaveBeenCalledWith(
        { token: 'refresh-token' },
        expect.objectContaining({
          is_revoked: true,
          revoked_by: 'User logout',
        }),
      );
    });
  });

  describe('revokeAllTokens', () => {
    it('should revoke all tokens for a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRefreshTokenModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await service.revokeAllTokens(userId);

      expect(mockRefreshTokenModel.updateMany).toHaveBeenCalledWith(
        { user_id: userId, is_revoked: false },
        expect.objectContaining({
          is_revoked: true,
          revoked_by: 'User request',
        }),
      );
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired and old revoked tokens', async () => {
      mockRefreshTokenModel.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await service.cleanupExpiredTokens();

      expect(mockRefreshTokenModel.deleteMany).toHaveBeenCalledWith({
        $or: [
          { expires_at: { $lt: expect.any(Date) } },
          {
            is_revoked: true,
            revoked_at: { $lt: expect.any(Date) },
          },
        ],
      });
    });
  });
});
