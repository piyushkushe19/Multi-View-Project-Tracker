import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { SimUser } from '../types';

const SIM_USERS: Omit<SimUser, 'taskId'>[] = [
  { id: 'sim-1', initials: 'BW', color: '#6f5de7' },
  { id: 'sim-2', initials: 'TN', color: '#ef9f27' },
  { id: 'sim-3', initials: 'AV', color: '#3db06a' },
  { id: 'sim-4', initials: 'KM', color: '#e24b4a' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useCollabSim() {
  const tasks      = useAppStore(s => s.tasks);
  const setSimUsers = useAppStore(s => s.setSimUsers);

  // Initialise once
  useEffect(() => {
    const pool = tasks.slice(0, 30);
    const initial: SimUser[] = SIM_USERS.map(u => ({
      ...u,
      taskId: pickRandom(pool).id,
    }));
    setSimUsers(initial);
  }, []); // intentionally run once

  // Tick: move one random sim user to a different task every 2.5–4.5s
  useEffect(() => {
    const pool = tasks.slice(0, 30);

    const tick = () => {
      setSimUsers(prev => {
        const next = [...prev];
        const idx  = Math.floor(Math.random() * next.length);
        next[idx]  = { ...next[idx], taskId: pickRandom(pool).id };
        return next;
      });
    };

    const schedule = () => {
      const delay = 2500 + Math.random() * 2000;
      return window.setTimeout(() => { tick(); timerId = schedule(); }, delay);
    };

    let timerId = schedule();
    return () => window.clearTimeout(timerId);
  }, [tasks, setSimUsers]);
}
