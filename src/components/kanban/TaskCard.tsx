import { useRef } from 'react';
import type { Task, SimUser } from '../../types';
import { getUserById } from '../../data/users';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';
import { PriorityBadge } from '../shared/PriorityBadge';
import { DueLabel } from '../shared/DueLabel';

interface Props {
  task: Task;
  simUsers: SimUser[];
  onDragStart: (e: React.PointerEvent, task: Task, cardEl: HTMLDivElement) => void;
  isDragging: boolean;
}

export function TaskCard({ task, simUsers, onDragStart, isDragging }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const user = getUserById(task.assigneeId);

  const cardSimUsers = simUsers.filter(su => su.taskId === task.id);
  const visibleSim = cardSimUsers.slice(0, 2);
  const overflow = cardSimUsers.length - visibleSim.length;

  return (
    <div
      ref={ref}
      data-task-id={task.id}
      onPointerDown={(e) => {
        if (ref.current) onDragStart(e, task, ref.current);
      }}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border-dim)',
        borderRadius: 8,
        padding: 12,
        cursor: 'grab',
        userSelect: 'none',
        position: 'relative',
        opacity: isDragging ? 0.35 : 1,
        transition: 'border-color 0.15s, opacity 0.15s',
        touchAction: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-dim)';
      }}
    >
      {/* Collab indicators */}
      {cardSimUsers.length > 0 && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
          {visibleSim.map((su, i) => (
            <div
              key={su.id}
              title={su.initials}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: su.color,
                color: '#fff',
                fontSize: 7,
                fontFamily: 'DM Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg3)',
                marginLeft: i === 0 ? 0 : -5,
                zIndex: visibleSim.length - i,
                transition: 'all 0.3s ease',
              }}
            >
              {su.initials}
            </div>
          ))}
          {overflow > 0 && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--bg4)',
                color: 'var(--text2)',
                fontSize: 7,
                fontFamily: 'DM Mono, monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg3)',
                marginLeft: -5,
              }}
            >
              +{overflow}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.45,
          marginBottom: 10,
          color: 'var(--text)',
          paddingRight: cardSimUsers.length > 0 ? 28 : 0,
        }}
      >
        {task.title}
      </p>

      {/* Priority + Due */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
        <PriorityBadge priority={task.priority} />
        <DueLabel dueDate={task.dueDate} />
      </div>

      {/* Assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <AssigneeAvatar user={user} size={22} />
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>{user.name}</span>
      </div>
    </div>
  );
}
