export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
