import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // Remove password from response
    const userObj = (user as { toObject(): Record<string, unknown> }).toObject();
    const { password, ...result } = userObj;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}