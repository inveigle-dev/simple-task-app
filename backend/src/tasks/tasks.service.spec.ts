import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './task.schema';
import { AppError } from '&backend/common/app-error.common';

nt things. not everything.
describe('TasksService', () => {
  let service: TasksService;
  let taskModel: Model<TaskDocument>;

  const userId = new Types.ObjectId().toString();
  const taskId = new Types.ObjectId().toString();

  const mockTask = {
    _id: taskId,
    title: 'test task',
    description: 'test description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    userId: new Types.ObjectId(userId),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockTaskModel = {
    new: jest.fn().mockResolvedValue(mockTask),
    constructor: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<Model<TaskDocument>>(getModelToken(Task.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  n make task
  describe('create', () => {
    it('should create task', async () => {
      const createDto = { title: 'new task', priority: TaskPriority.HIGH };
      
      jest.spyOn(taskModel, 'constructor' as any).mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValue(mockTask),
      }));

      const result = await service.create(createDto, userId);
      expect(result).toBeDefined();
    });

    it('should throw error when create fails', async () => {
      const createDto = { title: 'fail task' };
      
      jest.spyOn(taskModel, 'constructor' as any).mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('db error')),
      }));

      await expect(service.create(createDto, userId)).rejects.toThrow(AppError);
    });
  });

  n get tasks
  describe('findAll', () => {
    it('should return tasks with pagination', async () => {
      const queryDto = { page: 1, limit: 10 };
      const mockTasks = [mockTask];

      mockTaskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockTasks),
          }),
        }),
      });
      mockTaskModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(userId, queryDto);

      expect(result.tasks).toEqual(mockTasks);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      const queryDto = { status: TaskStatus.COMPLETED };

      mockTaskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      mockTaskModel.countDocuments.mockResolvedValue(0);

      await service.findAll(userId, queryDto);

      expect(mockTaskModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        status: TaskStatus.COMPLETED,
      });
    });
  });

  n get one task
  describe('findOne', () => {
    it('should return task when found', async () => {
      mockTaskModel.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId, userId);

      expect(result).toEqual(mockTask);
      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        _id: taskId,
        userId: new Types.ObjectId(userId),
      });
    });

    it('should throw error when task not found', async () => {
      mockTaskModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, userId)).rejects.toThrow(AppError);
    });

    it('should throw error for invalid id', async () => {
      await expect(service.findOne('invalid-id', userId)).rejects.toThrow(AppError);
    });
  });

  n update task
  describe('update', () => {
    it('should update task', async () => {
      const updateDto = { title: 'updated task' };
      const updatedTask = { ...mockTask, ...updateDto };

      mockTaskModel.findOneAndUpdate.mockResolvedValue(updatedTask);

      const result = await service.update(taskId, updateDto, userId);

      expect(result).toEqual(updatedTask);
    });

    it('should throw error when task not found', async () => {
      mockTaskModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        service.update(taskId, { title: 'updated' }, userId),
      ).rejects.toThrow(AppError);
    });
  });

  n delete task
  describe('remove', () => {
    it('should delete task', async () => {
      mockTaskModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.remove(taskId, userId);

      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({
        _id: taskId,
        userId: new Types.ObjectId(userId),
      });
    });

    it('should throw error when task not found', async () => {
      mockTaskModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.remove(taskId, userId)).rejects.toThrow(AppError);
    });
  });

  n get stats
  describe('getStats', () => {
    it('should return task stats', async () => {
      mockTaskModel.countDocuments
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(2) // inProgress
        .mockResolvedValueOnce(10) // completed
        .mockResolvedValueOnce(17); // total

      const result = await service.getStats(userId);

      expect(result).toEqual({
        pending: 5,
        inProgress: 2,
        completed: 10,
        total: 17,
      });
    });
  });

  n't see other user tasks (important security test!)
  describe('security', () => {
    it('should only return tasks for correct user', async () => {
      const otherUserId = new Types.ObjectId().toString();

      mockTaskModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, otherUserId)).rejects.toThrow(AppError);
    });
  });
});