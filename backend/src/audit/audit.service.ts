import { Injectable } from '@nestjs/common';
import { User } from '&backend/users/user.schema';

@Injectable()
export class AuditService {
  
  logAction(
    user: User, 
    action: string, 
    resource: string, 
    resourceId?: string,
    details?: any
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      userId: user.id,
      userEmail: user.email,
      organizationId: user.organizationId?.toString(),
      action,
      resource,
      resourceId,
      details,
    };

    console.log('AUDIT:', JSON.stringify(logEntry));
  }

  logTaskCreated(user: User, taskId: string, taskData: any) {
    this.logAction(user, 'CREATE_TASK', 'task', taskId, taskData);
  }

  logTaskUpdated(user: User, taskId: string, changes: any) {
    this.logAction(user, 'UPDATE_TASK', 'task', taskId, changes);
  }

  logTaskDeleted(user: User, taskId: string) {
    this.logAction(user, 'DELETE_TASK', 'task', taskId);
  }

  logLogin(user: User) {
    this.logAction(user, 'LOGIN', 'auth');
  }

  logLogout(user: User) {
    this.logAction(user, 'LOGOUT', 'auth');
  }
}