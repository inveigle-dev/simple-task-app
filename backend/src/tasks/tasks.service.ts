import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { AppError } from '&backend/common/app-error.common';
import { ErrorMessage } from '&backend/common/error-messages.enum';
import { AuditService } from '&backend/audit/audit.service';
import { User } from '&backend/users/user.schema';
import { PermissionsGuard } from '&backend/auth/guards/permissions.guard';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    if (!PermissionsGuard.canUserDo(user, 'create')) {
      throw new AppError(ErrorMessage.TASK_ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }

    try {
      const taskData = {
        ...createTaskDto,
        userId: new Types.ObjectId(user.id),
        organizationId: user.organizationId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      };

      const task = new this.taskModel(taskData);
      const savedTask = await task.save();
      
      this.auditService.logTaskCreated(user, savedTask.id, createTaskDto);
      return savedTask;
    } catch (error) {
      throw new AppError(ErrorMessage.TASK_CREATION_FAILED, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(user: User, query: QueryTasksDto) {
    const { page = 1, limit = 10 } = query;
    
    const filter: any = { 
      userId: new Types.ObjectId(user.id),
      organizationId: user.organizationId 
    };
    
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    try {
      const [tasks, total] = await Promise.all([
        this.taskModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        this.taskModel.countDocuments(filter)
      ]);

      return {
        tasks,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new AppError('Failed to get tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string, user: User): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(ErrorMessage.INVALID_TASK_ID, HttpStatus.BAD_REQUEST);
    }

    const task = await this.taskModel.findOne({ 
      _id: id, 
      organizationId: user.organizationId 
    });

    if (!task) {
      throw new AppError(ErrorMessage.TASK_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Check if user can access this task
    if (!PermissionsGuard.canAccessResource(user, task.userId.toString(), task.organizationId?.toString())) {
      throw new AppError(ErrorMessage.TASK_ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }

    return task;
  }

  async update(id: string, updateDto: UpdateTaskDto, user: User): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(ErrorMessage.INVALID_TASK_ID, HttpStatus.BAD_REQUEST);
    }

    const existingTask = await this.findOne(id, user);
    
    if (!PermissionsGuard.canUserDo(user, 'update')) {
      throw new AppError(ErrorMessage.TASK_ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }

    try {
      const updateData = {
        ...updateDto,
        dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
      };

      const task = await this.taskModel.findOneAndUpdate(
        { _id: id, organizationId: user.organizationId },
        updateData,
        { new: true }
      );

      if (!task) {
        throw new AppError(ErrorMessage.TASK_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      this.auditService.logTaskUpdated(user, task.id, updateDto);
      return task;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorMessage.TASK_UPDATE_FAILED, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string, user: User): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(ErrorMessage.INVALID_TASK_ID, HttpStatus.BAD_REQUEST);
    }

    await this.findOne(id, user); // Check access

    if (!PermissionsGuard.canUserDo(user, 'delete')) {
      throw new AppError(ErrorMessage.TASK_ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }

    const result = await this.taskModel.deleteOne({ 
      _id: id, 
      organizationId: user.organizationId 
    });

    if (result.deletedCount === 0) {
      throw new AppError(ErrorMessage.TASK_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    this.auditService.logTaskDeleted(user, id);
  }

  async getStats(user: User) {
    try {
      const filter = { organizationId: user.organizationId };
      
      // If user is VIEWER, only show their own stats
      if (user.roles.includes('VIEWER') && !user.roles.includes('ADMIN') && !user.roles.includes('OWNER')) {
        filter['userId'] = new Types.ObjectId(user.id);
      }
      
      const [pending, inProgress, completed, total] = await Promise.all([
        this.taskModel.countDocuments({ ...filter, status: 'pending' }),
        this.taskModel.countDocuments({ ...filter, status: 'in_progress' }),
        this.taskModel.countDocuments({ ...filter, status: 'completed' }),
        this.taskModel.countDocuments(filter)
      ]);

      return { pending, inProgress, completed, total };
    } catch (error) {
      throw new AppError(ErrorMessage.TASK_STATS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}