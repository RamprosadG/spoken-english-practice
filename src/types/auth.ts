export type UserRole = "admin" | "public";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}
