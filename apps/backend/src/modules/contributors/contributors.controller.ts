import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContributorsService } from './contributors.service';
import { CreateContributorDto } from './dto/create-contributor.dto';
import { UpdateContributorDto } from './dto/update-contributor.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { ContributorStatus } from './entities/contributor.entity';

@ApiTags('Contributors')
@Controller('contributors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributorsController {
  constructor(private readonly contributorsService: ContributorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contributor profile' })
  @ApiResponse({
    status: 201,
    description: 'Contributor profile created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already has a contributor profile',
  })
  @ApiBearerAuth()
  create(
    @Body() createContributorDto: CreateContributorDto,
    @CurrentUser() user: User,
  ) {
    return this.contributorsService.create(createContributorDto, user);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all contributors with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Contributors retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contributorsService.findAll(paginationDto);
  }

  @Get('top')
  @Public()
  @ApiOperation({ summary: 'Get top contributors by reputation' })
  @ApiResponse({
    status: 200,
    description: 'Top contributors retrieved successfully',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopContributors(@Query('limit') limit?: number) {
    return this.contributorsService.getTopContributors(limit);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available contributors for training' })
  @ApiResponse({
    status: 200,
    description: 'Available contributors retrieved successfully',
  })
  @ApiBearerAuth()
  getAvailableContributors(@Query('requirements') requirements?: any) {
    return this.contributorsService.getAvailableContributors(requirements);
  }

  @Get('statistics')
  @Public()
  @ApiOperation({ summary: 'Get contributor statistics' })
  @ApiResponse({
    status: 200,
    description: 'Contributor statistics retrieved successfully',
  })
  getStatistics() {
    return this.contributorsService.getStatistics();
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Get current user contributor profile' })
  @ApiResponse({
    status: 200,
    description: 'Contributor profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor profile not found',
  })
  @ApiBearerAuth()
  getMyProfile(@CurrentUser() user: User) {
    return this.contributorsService.findByUserId(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a contributor by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contributor retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contributor profile' })
  @ApiResponse({
    status: 200,
    description: 'Contributor profile updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContributorDto: UpdateContributorDto,
    @CurrentUser() user: User,
  ) {
    return this.contributorsService.update(id, updateContributorDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contributor profile' })
  @ApiResponse({
    status: 200,
    description: 'Contributor profile deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.contributorsService.remove(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update contributor status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contributor status updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ContributorStatus,
  ) {
    return this.contributorsService.updateStatus(id, status);
  }

  @Patch(':id/reputation')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update contributor reputation score (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contributor reputation updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  updateReputationScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('score') score: number,
  ) {
    return this.contributorsService.updateReputationScore(id, score);
  }

  @Post(':id/earnings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add earnings to contributor (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contributor earnings updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  addEarnings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('earnings') earnings: number,
  ) {
    return this.contributorsService.updateTotalEarnings(id, earnings);
  }

  @Post(':id/contribution')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Increment contributor contributions (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contributor contributions updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  incrementContributions(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributorsService.incrementContributions(id);
  }

  @Post(':id/activity')
  @ApiOperation({ summary: 'Update last active timestamp' })
  @ApiResponse({
    status: 200,
    description: 'Last active timestamp updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contributor not found',
  })
  @ApiBearerAuth()
  updateLastActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributorsService.updateLastActiveAt(id);
  }
}