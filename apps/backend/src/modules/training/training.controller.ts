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
import { TrainingService } from './training.service';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Training')
@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training session' })
  @ApiResponse({
    status: 201,
    description: 'Training session created successfully',
  })
  @ApiBearerAuth()
  create(
    @Body() createTrainingSessionDto: CreateTrainingSessionDto,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.create(createTrainingSessionDto, user);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all training sessions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Training sessions retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user?: User,
  ) {
    return this.trainingService.findAll(paginationDto, user);
  }

  @Get('my-sessions')
  @ApiOperation({ summary: 'Get current user training sessions' })
  @ApiResponse({
    status: 200,
    description: 'User training sessions retrieved successfully',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findMyTrainingSessions(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.findAll(paginationDto, user);
  }

  @Get('statistics')
  @Public()
  @ApiOperation({ summary: 'Get training statistics' })
  @ApiResponse({
    status: 200,
    description: 'Training statistics retrieved successfully',
  })
  getStatistics(@CurrentUser() user?: User) {
    return this.trainingService.getStatistics(user);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a training session by ID' })
  @ApiResponse({
    status: 200,
    description: 'Training session retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ) {
    return this.trainingService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only owner can update',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found',
  })
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrainingSessionDto: UpdateTrainingSessionDto,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.update(id, updateTrainingSessionDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only owner can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found',
  })
  @ApiBearerAuth()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.remove(id, user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only owner can start',
  })
  @ApiBearerAuth()
  startTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.startTraining(id, user);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session paused successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only owner can pause',
  })
  @ApiBearerAuth()
  pauseTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.pauseTraining(id, user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a training session' })
  @ApiResponse({
    status: 200,
    description: 'Training session completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only owner can complete',
  })
  @ApiBearerAuth()
  completeTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.trainingService.completeTraining(id, user);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update training progress' })
  @ApiResponse({
    status: 200,
    description: 'Training progress updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found',
  })
  @ApiBearerAuth()
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('progress') progress: number,
  ) {
    return this.trainingService.updateProgress(id, progress);
  }
}