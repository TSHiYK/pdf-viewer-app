export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  organizationId: string;
}