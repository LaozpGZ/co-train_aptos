import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorsService } from './contributors.service';
import { ContributorsController } from './contributors.controller';
import { Contributor } from './entities/contributor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contributor])],
  controllers: [ContributorsController],
  providers: [ContributorsService],
  exports: [ContributorsService],
})
export class ContributorsModule {}