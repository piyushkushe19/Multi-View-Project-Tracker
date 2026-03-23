import type { User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Ram Krshna',     initials: 'AK', color: '#6f5de7' },
  { id: 'u2', name: 'Sham Singh',   initials: 'ST', color: '#1d9e75' },
  { id: 'u3', name: 'Piyush Kushe',   initials: 'JL', color: '#e24b4a' },
  { id: 'u4', name: 'Neel Raj', initials: 'CR', color: '#ef9f27' },
  { id: 'u5', name: 'Monalisa Kulkarni',  initials: 'MC', color: '#378add' },
  { id: 'u6', name: 'Sagar Hinge',   initials: 'RP', color: '#d4537e' },
];

export const getUserById = (id: string): User =>
  USERS.find(u => u.id === id) ?? USERS[0];
