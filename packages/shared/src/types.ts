export type UserRole = 'admin' | 'user' | 'vendor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
