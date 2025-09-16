import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ 
      $or: [
        { email: createUserDto.email },
        { username: createUserDto.username }
      ]
    });
    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}