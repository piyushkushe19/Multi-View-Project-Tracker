import type { User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Ram Krshna',     initials: 'RM', color: '#6f5de7' },
  { id: 'u2', name: 'Sham Singh',   initials: 'SS', color: '#1d9e75' },
  { id: 'u3', name: 'Piyush Kushe',   initials: 'PK', color: '#e24b4a' },
  { id: 'u4', name: 'Neel Raj', initials: 'NR', color: '#ef9f27' },
  { id: 'u5', name: 'Monalisa Kulkarni',  initials: 'MK', color: '#378add' },
  { id: 'u6', name: 'Sagar Hinge',   initials: 'SH', color: '#d4537e' },
];

export const getUserById = (id: string): User =>
  USERS.find(u => u.id === id) ?? USERS[0];
