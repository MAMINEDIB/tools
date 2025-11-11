export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
