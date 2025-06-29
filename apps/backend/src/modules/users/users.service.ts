import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, walletAddress } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email },
        ...(walletAddress ? [{ walletAddress }] : []),
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or wallet address already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      emailVerificationToken,
      status: UserStatus.PENDING,
    });

    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.email ILIKE :search OR user.username ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['trainingSessions', 'contributorProfiles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { walletAddress } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Email updates are not allowed through this endpoint
    // Email is excluded from UpdateUserDto

    // Check for wallet address conflicts
    if (updateUserDto.walletAddress && updateUserDto.walletAddress !== user.walletAddress) {
      const existingUser = await this.findByWalletAddress(updateUserDto.walletAddress);
      if (existingUser) {
        throw new ConflictException('Wallet address already in use');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.status = UserStatus.ACTIVE;

    return this.userRepository.save(user);
  }

  async updateTokenBalance(id: string, amount: number): Promise<User> {
    const user = await this.findOne(id);
    user.tokenBalance = Number(user.tokenBalance) + amount;
    return this.userRepository.save(user);
  }

  async updateReputationScore(id: string, score: number): Promise<User> {
    const user = await this.findOne(id);
    user.reputationScore += score;
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.lastLoginAt = new Date();
    return this.userRepository.save(user);
  }

  async getStatistics() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const contributors = await this.userRepository.count({ where: { role: UserRole.CONTRIBUTOR } });
    const admins = await this.userRepository.count({ where: { role: UserRole.ADMIN } });

    return {
      total,
      active,
      contributors,
      admins,
      growth: {
        // Add growth statistics here
      },
    };
  }
}