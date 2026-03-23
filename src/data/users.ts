import type { User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alex Kim',     initials: 'AK', color: '#6f5de7' },
  { id: 'u2', name: 'Sam Torres',   initials: 'ST', color: '#1d9e75' },
  { id: 'u3', name: 'Jordan Lee',   initials: 'JL', color: '#e24b4a' },
  { id: 'u4', name: 'Casey Rivera', initials: 'CR', color: '#ef9f27' },
  { id: 'u5', name: 'Morgan Chen',  initials: 'MC', color: '#378add' },
  { id: 'u6', name: 'Riley Park',   initials: 'RP', color: '#d4537e' },
];

export const getUserById = (id: string): User =>
  USERS.find(u => u.id === id) ?? USERS[0];
