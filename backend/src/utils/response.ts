export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export const successResponse = <T>(data?: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};

export const errorResponse = (error: string, details?: Array<{ field: string; message: string }>): ApiResponse => {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
};
