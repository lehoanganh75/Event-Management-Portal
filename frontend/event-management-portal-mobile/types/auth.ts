export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string; // ISO date string
  gender?: Gender;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}
