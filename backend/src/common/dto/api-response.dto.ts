export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;

  static success<T>(message: string, data?: T): ApiResponse<T> {
    return { success: true, message, data };
  }

  static error(message: string): ApiResponse<null> {
    return { success: false, message };
  }
}
