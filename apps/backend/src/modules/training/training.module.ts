import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingSession } from './entities/training-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingSession]),
    EventEmitterModule,
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}