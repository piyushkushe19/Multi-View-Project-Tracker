import { useEffect, useRef } from 'react';
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
  const tasks       = useAppStore(s => s.tasks);
  const setSimUsers = useAppStore(s => s.setSimUsers);

  // Mirror current simUsers into a ref so the interval can read
  // latest state without a stale closure, without being in deps
  const simUsersRef = useRef<SimUser[]>([]);
  const simUsers    = useAppStore(s => s.simUsers);
  useEffect(() => { simUsersRef.current = simUsers; }, [simUsers]);

  // Initialise once on mount
  useEffect(() => {
    const pool = tasks.slice(0, 30);
    const initial: SimUser[] = SIM_USERS.map(u => ({
      ...u,
      taskId: pickRandom(pool).id,
    }));
    setSimUsers(initial);
    simUsersRef.current = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick: move one random sim user to a new task every 2.5–4.5 s
  useEffect(() => {
    const pool = tasks.slice(0, 30);
    if (pool.length === 0) return;

    let timerId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = 2500 + Math.random() * 2000;
      timerId = setTimeout(() => {
        const current = simUsersRef.current;
        if (current.length > 0) {
          const next = [...current];
          const idx  = Math.floor(Math.random() * next.length);
          next[idx]  = { ...next[idx], taskId: pickRandom(pool).id };
          setSimUsers(next); // plain array — no updater function
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
