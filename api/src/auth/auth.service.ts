import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcryptjs.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: { username: string; password: string; email?: string }): Promise<User> {
    // Check if username already exists
    const existingUser = await this.usersRepository.findOne({ where: { username: registerDto.username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(registerDto.password, saltRounds);

    // Create new user
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      email: registerDto.email,
      role: UserRole.OPERATOR, // default role
    });

    return this.usersRepository.save(newUser);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
