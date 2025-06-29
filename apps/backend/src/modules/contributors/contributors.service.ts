import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contributor, ContributorStatus } from './entities/contributor.entity';
import { CreateContributorDto } from './dto/create-contributor.dto';
import { UpdateContributorDto } from './dto/update-contributor.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ContributorsService {
  constructor(
    @InjectRepository(Contributor)
    private readonly contributorRepository: Repository<Contributor>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createContributorDto: CreateContributorDto,
    user: User,
  ): Promise<Contributor> {
    // Check if user already has a contributor profile
    const existingContributor = await this.contributorRepository.findOne({
      where: { userId: user.id },
    });

    if (existingContributor) {
      throw new BadRequestException('User already has a contributor profile');
    }

    const contributor = this.contributorRepository.create({
      name: createContributorDto.name,
      location: createContributorDto.location,
      hardware: createContributorDto.hardwareSpecs ? {
        gpu: createContributorDto.hardwareSpecs.gpu ? {
          model: createContributorDto.hardwareSpecs.gpu,
          memory: '0GB',
          count: 1,
        } : undefined,
        cpu: createContributorDto.hardwareSpecs.cpu ? {
          model: createContributorDto.hardwareSpecs.cpu,
          cores: 0,
          threads: 0,
        } : undefined,
        ram: createContributorDto.hardwareSpecs.ram ? {
          total: createContributorDto.hardwareSpecs.ram,
          available: createContributorDto.hardwareSpecs.ram,
        } : undefined,
        storage: createContributorDto.hardwareSpecs.storage ? {
          type: 'SSD' as const,
          capacity: createContributorDto.hardwareSpecs.storage,
        } : undefined,
      } : undefined,
      capabilities: {
        supportedModels: createContributorDto.capabilities || [],
        maxBatchSize: 1,
        specializations: createContributorDto.capabilities || [],
      },
      performance: createContributorDto.performanceMetrics ? {
        averageSpeed: createContributorDto.performanceMetrics.avgTrainingTime || 0,
        reliability: createContributorDto.performanceMetrics.successRate || 0,
        efficiency: createContributorDto.performanceMetrics.uptime || 0,
      } : undefined,
      userId: user.id,
      status: ContributorStatus.OFFLINE,
    });

    const savedContributor = await this.contributorRepository.save(contributor) as unknown as Contributor;

    // Emit event for contributor registration
    this.eventEmitter.emit('contributor.registered', savedContributor);

    return savedContributor;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contributorRepository
      .createQueryBuilder('contributor')
      .leftJoinAndSelect('contributor.user', 'user')
      .leftJoinAndSelect('contributor.trainingSessions', 'trainingSessions');

    if (search) {
      queryBuilder.where(
        'contributor.name ILIKE :search OR contributor.location ILIKE :search OR user.username ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [contributors, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('contributor.reputationScore', 'DESC')
      .getManyAndCount();

    return {
      data: contributors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Contributor> {
    const contributor = await this.contributorRepository.findOne({
      where: { id },
      relations: ['user', 'trainingSessions'],
    });

    if (!contributor) {
      throw new NotFoundException('Contributor not found');
    }

    return contributor;
  }

  async findByUserId(userId: string): Promise<Contributor> {
    const contributor = await this.contributorRepository.findOne({
      where: { userId },
      relations: ['user', 'trainingSessions'],
    });

    if (!contributor) {
      throw new NotFoundException('Contributor profile not found for this user');
    }

    return contributor;
  }

  async update(
    id: string,
    updateContributorDto: UpdateContributorDto,
    user: User,
  ): Promise<Contributor> {
    const contributor = await this.findOne(id);

    // Only the owner can update their contributor profile
    if (contributor.userId !== user.id) {
      throw new ForbiddenException('You can only update your own contributor profile');
    }

    Object.assign(contributor, updateContributorDto);
    const updatedContributor = await this.contributorRepository.save(contributor);

    // Emit event for contributor update
    this.eventEmitter.emit('contributor.updated', updatedContributor);

    return updatedContributor;
  }

  async remove(id: string, user: User): Promise<void> {
    const contributor = await this.findOne(id);

    // Only the owner can delete their contributor profile
    if (contributor.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own contributor profile');
    }

    // Prevent deletion if contributor has active training session
    if (contributor.currentTrainingSession) {
      throw new BadRequestException(
        'Cannot delete contributor profile with active training session',
      );
    }

    await this.contributorRepository.remove(contributor);

    // Emit event for contributor deletion
    this.eventEmitter.emit('contributor.deleted', { id, userId: user.id });
  }

  async updateStatus(id: string, status: ContributorStatus): Promise<Contributor> {
    const contributor = await this.findOne(id);
    contributor.status = status;
    
    const updatedContributor = await this.contributorRepository.save(contributor);

    // Emit event for status change
    this.eventEmitter.emit('contributor.statusChanged', {
      contributor: updatedContributor,
      previousStatus: contributor.status,
      newStatus: status,
    });

    return updatedContributor;
  }

  async updateReputationScore(id: string, score: number): Promise<Contributor> {
    const contributor = await this.findOne(id);
    contributor.reputationScore = Math.max(0, score);
    return this.contributorRepository.save(contributor);
  }

  async updateTotalEarnings(id: string, earnings: number): Promise<Contributor> {
    const contributor = await this.findOne(id);
    contributor.totalEarnings += earnings;
    return this.contributorRepository.save(contributor);
  }

  async incrementContributions(id: string): Promise<Contributor> {
    const contributor = await this.findOne(id);
    contributor.totalContributions += 1;
    contributor.lastContributionAt = new Date();
    return this.contributorRepository.save(contributor);
  }

  async updateLastActiveAt(id: string): Promise<Contributor> {
    const contributor = await this.findOne(id);
    contributor.lastActiveAt = new Date();
    return this.contributorRepository.save(contributor);
  }

  async getTopContributors(limit: number = 10) {
    return this.contributorRepository.find({
      relations: ['user'],
      order: { reputationScore: 'DESC' },
      take: limit,
      where: { status: ContributorStatus.ONLINE },
    });
  }

  async getAvailableContributors(requirements?: any) {
    const queryBuilder = this.contributorRepository
      .createQueryBuilder('contributor')
      .leftJoinAndSelect('contributor.user', 'user')
      .where('contributor.status = :status', { status: ContributorStatus.ONLINE })
      .andWhere('contributor.availability = :availability', { availability: true });

    // Add hardware requirements filtering if provided
    if (requirements) {
      if (requirements.minGPU) {
        queryBuilder.andWhere(
          "contributor.hardwareSpecs->>'gpu' >= :minGPU",
          { minGPU: requirements.minGPU },
        );
      }
      if (requirements.minRAM) {
        queryBuilder.andWhere(
          "contributor.hardwareSpecs->>'ram' >= :minRAM",
          { minRAM: requirements.minRAM },
        );
      }
    }

    return queryBuilder
      .orderBy('contributor.reputationScore', 'DESC')
      .getMany();
  }

  async getStatistics() {
    const total = await this.contributorRepository.count();
    const active = await this.contributorRepository.count({
      where: { status: ContributorStatus.ONLINE },
    });
    const pending = await this.contributorRepository.count({
      where: { status: ContributorStatus.OFFLINE },
    });
    const suspended = await this.contributorRepository.count({
      where: { status: ContributorStatus.MAINTENANCE },
    });

    const avgReputationResult = await this.contributorRepository
      .createQueryBuilder('contributor')
      .select('AVG(contributor.reputationScore)', 'avgReputation')
      .where('contributor.status = :status', { status: ContributorStatus.ONLINE })
      .getRawOne();

    const totalEarningsResult = await this.contributorRepository
      .createQueryBuilder('contributor')
      .select('SUM(contributor.totalEarnings)', 'totalEarnings')
      .getRawOne();

    return {
      total,
      active,
      pending,
      suspended,
      averageReputation: parseFloat(avgReputationResult?.avgReputation || '0'),
      totalEarnings: parseFloat(totalEarningsResult?.totalEarnings || '0'),
    };
  }
}