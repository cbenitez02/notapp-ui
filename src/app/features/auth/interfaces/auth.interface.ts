import { User } from '../../../core/interfaces/users.interface';

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterBody {
  fullname: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

export interface GetUserProfileResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    role: 'buyer' | 'seller' | 'both' | 'admin';
  };
}
