import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus, TaskPriority } from './task.schema';
import { User } from '&backend/users/user.schema';
import { JwtAuthGuard } from '&backend/auth/guards/auth.guard';

ntroller. simple.
describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockUser: Partial<User> = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  };

  const mockTask = {
    id: '507f1f77bcf86cd799439012',
    title: 'test task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    userId: mockUser.id,
  };

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  ntroller calls service with right params
  it('should create task', async () => {
    const createDto = { title: 'new task' };
    mockTasksService.create.mockResolvedValue(mockTask);

    const result = await controller.create(createDto, mockUser as User);

    expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
    expect(result).toEqual(mockTask);
  });

  it('should get all tasks', async () => {
    const query = { page: 1, limit: 10 };
    const expected = { tasks: [mockTask], total: 1, page: 1, pages: 1 };
    mockTasksService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query, mockUser as User);

    expect(service.findAll).toHaveBeenCalledWith(mockUser.id, query);
    expect(result).toEqual(expected);
  });

  it('should get one task', async () => {
    mockTasksService.findOne.mockResolvedValue(mockTask);

    const result = await controller.findOne('task-id', mockUser as User);

    expect(service.findOne).toHaveBeenCalledWith('task-id', mockUser.id);
    expect(result).toEqual(mockTask);
  });

  it('should update task', async () => {
    const updateDto = { title: 'updated' };
    const updatedTask = { ...mockTask, ...updateDto };
    mockTasksService.update.mockResolvedValue(updatedTask);

    const result = await controller.update('task-id', updateDto, mockUser as User);

    expect(service.update).toHaveBeenCalledWith('task-id', updateDto, mockUser.id);
    expect(result).toEqual(updatedTask);
  });

  it('should delete task', async () => {
    mockTasksService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('task-id', mockUser as User);

    expect(service.remove).toHaveBeenCalledWith('task-id', mockUser.id);
    expect(result).toBeUndefined();
  });

  it('should get stats', async () => {
    const stats = { pending: 5, inProgress: 2, completed: 10, total: 17 };
    mockTasksService.getStats.mockResolvedValue(stats);

    const result = await controller.getStats(mockUser as User);

    expect(service.getStats).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(stats);
  });
});