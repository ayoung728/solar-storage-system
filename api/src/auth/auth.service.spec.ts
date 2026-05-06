import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    id: 1,
    username: 'testuser',
    password: '$2a$10$hashedpassword', // bcrypt hashed
    role: UserRole.OPERATOR,
    email: 'test@example.com',
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    verify: jest.fn().mockReturnValue({ id: 1, username: 'testuser' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const registerDto = {
        username: 'newuser',
        password: 'plainpassword123',
        email: 'new@example.com',
      };

      mockRepository.findOne.mockResolvedValue(null); // no existing user
      mockRepository.create.mockReturnValue({ ...mockUser, username: 'newuser' });
      mockRepository.save.mockResolvedValue({ ...mockUser, id: 2 });

      const result = await service.register(registerDto as any);

      expect(bcryptjs.hash).toHaveBeenCalledWith('plainpassword123', 10);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if username exists', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'newpassword123',
      };

      mockRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.register(registerDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return accessToken if credentials are valid', async () => {
      const loginDto = { username: 'testuser', password: 'correctpassword' };

      mockRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => true);

      const result = await service.login(loginDto as any);

      expect(result).toHaveProperty('accessToken');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };

      mockRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => false);

      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = { username: 'nonexistent', password: 'password' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user object without password if credentials are valid', async () => {
      const loginDto = { username: 'testuser', password: 'correctpassword' };

      mockRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcryptjs, 'compare').mockImplementation(async () => true);

      const result = await service.validateUser('testuser', 'correctpassword');

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('role');
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
    });
  });
});
