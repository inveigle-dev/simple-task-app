import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, TaskSchema } from './task.schema';
import { AuditService } from '&backend/audit/audit.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, AuditService],
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  exports: [TasksService],
})
export class TasksModule {}