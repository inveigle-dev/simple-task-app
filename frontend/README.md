# Frontend - Task Management System

A modern React frontend for the secure task management system, featuring a Kanban-style interface with role-based access control.

## 🎯 Overview

This frontend provides an intuitive interface for managing tasks within organizations, with different views and capabilities based on user roles (Owner, Admin, Viewer).

## 🏗️ Architecture

### Technology Stack
- **React 19** - Component framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **React Query** - Server state management

### State Management Strategy

**Zustand Stores:**
```typescript
// Auth Store - User authentication and session
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Tasks Store - Task management and filters
interface TasksStore {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  view: 'kanban' | 'list' | 'calendar';
  setFilters: (filters: Partial<TaskFilters>) => void;
  setView: (view: ViewType) => void;
  selectTask: (task: Task | null) => void;
}

// Organization Store - Organization context
interface OrganizationStore {
  currentOrg: Organization | null;
  members: User[];
  stats: OrgStats;
  setCurrentOrg: (org: Organization) => void;
  loadMembers: () => Promise<void>;
  loadStats: () => Promise<void>;
}

// UI Store - Global UI state
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

## 📁 Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── task/            # Task-specific components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard and overview
│   ├── tasks/           # Task management pages
│   └── organization/    # Organization management
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── services/            # API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # App constants
```

## 🎨 UI Components & Pages

### Core Components

**Layout Components:**
- `AppLayout` - Main application layout with sidebar and header
- `Sidebar` - Navigation with role-based menu items
- `Header` - Top bar with user menu and notifications
- `BreadcrumbNav` - Page navigation breadcrumbs

**Task Components:**
- `KanbanBoard` - Drag-and-drop task board (pending → in_progress → completed)
- `TaskCard` - Individual task display with priority indicators
- `TaskForm` - Create/edit task modal with validation
- `TaskFilters` - Filter bar (status, priority, assignee, due date)
- `TaskList` - Alternative list view for tasks
- `TaskDetails` - Detailed task view with comments and history

**Organization Components:**
- `OrgSwitcher` - Organization selection dropdown
- `MemberList` - Organization members with role indicators
- `OrgStats` - Dashboard statistics and charts
- `RoleManager` - User role assignment (Admin/Owner only)

### Page Structure

**Authentication Flow:**
```typescript
// /auth/login
const LoginPage = () => {
  const login = useAuthStore(state => state.login);
  const { register, handleSubmit } = useForm<LoginForm>();
  
  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleSubmit(onSubmit)} />
    </AuthLayout>
  );
};
```

**Main Dashboard:**
```typescript
// /dashboard
const DashboardPage = () => {
  const { user } = useAuthStore();
  const { stats, loadStats } = useOrganizationStore();
  const { tasks } = useTasksStore();

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AppLayout>
      <DashboardHeader user={user} />
      <StatsOverview stats={stats} />
      <RecentTasks tasks={tasks.slice(0, 5)} />
      <QuickActions userRole={user.roles[0]} />
    </AppLayout>
  );
};
```

**Kanban Board:**
```typescript
// /tasks
const TasksPage = () => {
  const { tasks, filters, view, setFilters } = useTasksStore();
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters)
  });

  return (
    <AppLayout>
      <TasksHeader />
      <TaskFilters filters={filters} onChange={setFilters} />
      {view === 'kanban' ? (
        <KanbanBoard tasks={tasksData?.tasks || []} />
      ) : (
        <TaskList tasks={tasksData?.tasks || []} />
      )}
    </AppLayout>
  );
};
```

## 🔐 Role-Based UI

### Permission-Based Rendering
```typescript
// Custom hook for role-based access
const usePermissions = () => {
  const { user } = useAuthStore();
  
  return {
    canCreateTask: user?.roles.includes('OWNER') || user?.roles.includes('ADMIN'),
    canEditAnyTask: user?.roles.includes('OWNER') || user?.roles.includes('ADMIN'),
    canDeleteTask: user?.roles.includes('OWNER'),
    canManageUsers: user?.roles.includes('OWNER'),
    canViewAllTasks: user?.roles.includes('OWNER') || user?.roles.includes('ADMIN'),
  };
};

// Component with role-based rendering
const TaskActions = ({ task }: { task: Task }) => {
  const { canEditAnyTask, canDeleteTask } = usePermissions();
  const { user } = useAuthStore();
  
  const canEdit = canEditAnyTask || task.userId === user?.id;
  const canDelete = canDeleteTask || (task.userId === user?.id && user?.roles.includes('ADMIN'));

  return (
    <div className="flex gap-2">
      {canEdit && <EditTaskButton task={task} />}
      {canDelete && <DeleteTaskButton task={task} />}
    </div>
  );
};
```

### View Customization by Role
- **OWNER**: Full dashboard, all tasks, user management, organization settings
- **ADMIN**: Organization tasks, member management, assignment capabilities
- **VIEWER**: Assigned tasks only, read-only organization info

## 🌐 API Integration

### Service Layer
```typescript
// services/api.ts
class ApiService {
  private axios = axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.axios.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle auth errors
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }
}

// services/tasks.ts
export const tasksApi = {
  getTasks: (filters: TaskFilters) => 
    api.get<PaginatedResponse<Task>>('/tasks', { params: filters }),
  
  createTask: (data: CreateTaskDto) => 
    api.post<Task>('/tasks', data),
  
  updateTask: (id: string, data: UpdateTaskDto) => 
    api.patch<Task>(`/tasks/${id}`, data),
  
  deleteTask: (id: string) => 
    api.delete(`/tasks/${id}`),
  
  getStats: () => 
    api.get<TaskStats>('/tasks/stats'),
};
```

### React Query Integration
```typescript
// hooks/useTasks.ts
export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Task created successfully'
      });
    },
  });
};
```

## 🎯 Key Features Implementation

### 1. Kanban Board with Drag & Drop
```typescript
// Using @dnd-kit for drag and drop
const KanbanBoard = ({ tasks }: { tasks: Task[] }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const task = tasks.find(t => t.id === active.id);
      const newStatus = over.id as TaskStatus;
      
      if (task) {
        updateTask.mutate({
          id: task.id,
          data: { status: newStatus }
        });
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-6">
        {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map(status => (
          <KanbanColumn key={status} status={status} tasks={tasks.filter(t => t.status === status)} />
        ))}
      </div>
    </DndContext>
  );
};
```

### 2. Real-time Updates (Future Enhancement)
```typescript
// WebSocket integration for live updates
const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.organizationId) return;

    const ws = new WebSocket(`ws://localhost:3000/ws?orgId=${user.organizationId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'TASK_UPDATED':
          queryClient.setQueryData(['tasks'], (old: any) => {
            // Update task in cache
          });
          break;
        case 'TASK_CREATED':
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          break;
      }
    };

    return () => ws.close();
  }, [user?.organizationId]);
};
```

### 3. Responsive Design
```typescript
// Mobile-first responsive components
const TaskCard = ({ task }: { task: Task }) => {
  return (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-medium truncate">{task.title}</h3>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>
        {task.dueDate && (
          <p className="text-sm text-muted-foreground mt-2">
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
```

## 🚀 Development Workflow

### 1. Setup and Installation
```bash
# Install dependencies
pnpm install

# Install additional frontend dependencies
pnpm add zustand @tanstack/react-query axios react-hook-form
pnpm add @dnd-kit/core @dnd-kit/sortable lucide-react
pnpm add -D @types/node

# Start development server
nx serve @apps/frontend
```

### 2. Environment Configuration
```env
# .env.local
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=Task Manager
```

### 3. Development Guidelines
- **Component Structure**: Use functional components with hooks
- **State Management**: Zustand for global state, React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: Strict TypeScript configuration
- **Testing**: Vitest for unit tests, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## 🧪 Testing Strategy

### Component Testing
```typescript
// __tests__/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '../components/task/TaskCard';
import { mockTask } from '../__mocks__/task';

describe('TaskCard', () => {
  it('displays task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.priority)).toBeInTheDocument();
    expect(screen.getByText(mockTask.status)).toBeInTheDocument();
  });

  it('shows due date when present', () => {
    const taskWithDueDate = { ...mockTask, dueDate: '2024-12-31' };
    render(<TaskCard task={taskWithDueDate} />);
    
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });
});
```

### Store Testing
```typescript
// __tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });
});
```

## 📱 Mobile Considerations

### Progressive Web App (PWA)
- Service worker for offline functionality
- App manifest for mobile installation
- Responsive breakpoints for all screen sizes
- Touch-friendly interactions

### Mobile-Specific Features
- Pull-to-refresh for task lists
- Swipe gestures for task actions
- Optimized touch targets
- Reduced animations for performance

## 🔮 Future Enhancements

### Phase 1 - Core UI
- [ ] Authentication flow
- [ ] Basic task CRUD
- [ ] Kanban board
- [ ] Role-based navigation

### Phase 2 - Advanced Features
- [ ] Real-time updates via WebSocket
- [ ] Advanced filtering and search
- [ ] Task assignments and notifications
- [ ] Organization management UI

### Phase 3 - Polish & Performance
- [ ] PWA capabilities
- [ ] Advanced animations
- [ ] Accessibility improvements
- [ ] Performance optimizations

## 📚 Resources

- [React 19 Documentation](https://react.dev/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

This frontend architecture provides a solid foundation for building a modern, scalable task management interface with excellent user experience and maintainable code structure.