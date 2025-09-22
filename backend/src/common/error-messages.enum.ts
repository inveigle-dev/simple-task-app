export enum ErrorMessage {
  CUSTOM_SERVER_ERROR = `If you are seeing this, one of the devs is getting fired🙃🙃🙃!!!`,

  USER_ALREADY_EXISTS = 'Error Creating user!, duplicate account!',

  JWT_EXPIRED = 'jwt expired',

  UNIQUE_CONSTRAINT_VIOLATION = '2601',

  INVALID_LOGIN_CREDENTIALS = 'Invalid login credentials',

  NO_USER_FOUND = 'No user found with the credentials you provided!.',

  TOKEN_EXPIRED = 'Token is not found for this request!',

  INVALID_TOKEN = 'Invalid token!. this token cannot be validated!',

  PASSWORD_MISMATCH = 'Password and confirm password do not match.',

  ENTITY_ALREADY_EXIST = 'Entity cannot be created!. This entity already exists',

  BUSINESS_TYPE_DOES_NOT_MATCH_REQUIRED_TYPE = 'The business type you provided does not match the required business type!, [charity, corporate]',

  MSSQL_EREQUEST = 'EREQUEST',

  FAILED_TO_SEND_EMAIL = 'Error sending this email!!!....retrying......',

  FIELD_IS_OF_TYPE_STRING = 'Field must be of type string',

  FIELD_IS_REQUIRED = 'This field is required!',

  PASSWORD_TOO_WEAK = 'password too weak!, password must have at least one lowercase character, one uppercase character, one special character eg:(@!#%$^&?_+|*><) and must be a minimum of 8 characters and maximum of 20 characters!',

  INVALID_PHONE_NUMBER_FORMAT = 'Phone number format is invalid!!',

  OTP_REQUEST_FAILURE = 'Something happened while trying to send an OTP!. please try again!',

  INVALID_EMAIL_ADDRESS = 'This field must be a valid email address.',

  COULD_NOT_UPDATE_MILEAGE = 'Could not update milage!. Something went wrong!. Please try again!',

  PASSWORD_HAS_BEEN_USED_PREVIOUSLY = 'You cannot use this password twice!. please select a new password, and try again!',

  // Task-related errors
  TASK_NOT_FOUND = 'Task not found or you do not have permission to access it',
  
  INVALID_TASK_ID = 'Invalid task ID format',
  
  TASK_ACCESS_DENIED = 'You do not have permission to access this task',
  
  TASK_CREATION_FAILED = 'Failed to create task. Please try again',
  
  TASK_UPDATE_FAILED = 'Failed to update task. Please try again',
  
  TASK_DELETE_FAILED = 'Failed to delete task. Please try again',
  
  INVALID_TASK_DATA = 'Invalid task data provided',
  
  TASK_ALREADY_EXISTS = 'A task with this title already exists',
  
  TASK_DUE_DATE_INVALID = 'Due date cannot be in the past',
  
  TASK_TITLE_TOO_LONG = 'Task title must be 200 characters or less',
  
  TASK_DESCRIPTION_TOO_LONG = 'Task description must be 1000 characters or less',
  
  INVALID_TASK_STATUS = 'Invalid task status. Must be one of: pending, in_progress, completed, cancelled',
  
  INVALID_TASK_PRIORITY = 'Invalid task priority. Must be one of: low, medium, high, urgent',
  
  TASK_STATS_ERROR = 'Failed to retrieve task statistics',
}
