import { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { STATUS_ORDER } from '../../types';
import type { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { useDragAndDrop } from './useDragAndDrop';

export function KanbanBoard() {
  const getFilteredTasks = useAppStore(s => s.getFilteredTasks);
  const updateTaskStatus  = useAppStore(s => s.updateTaskStatus);
  const simUsers          = useAppStore(s => s.simUsers);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleDrop = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    setDraggingTaskId(null);
  }, [updateTaskStatus]);

  const { startDrag, onPointerMove, onPointerUp, onPointerCancel } = useDragAndDrop({
    onDrop: handleDrop,
  });

  const handleDragStart = useCallback((
    e: React.PointerEvent,
    task: Task,
    cardEl: HTMLDivElement,
  ) => {
    setDraggingTaskId(task.id);
    startDrag(e, task, cardEl);
  }, [startDrag]);

  const tasks = getFilteredTasks();

  return (
    <div
      id="kanban-board"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        display: 'flex',
        gap: 16,
        padding: '20px 24px',
        height: '100%',
        overflowX: 'auto',
      }}
    >
      {STATUS_ORDER.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          simUsers={simUsers}
          draggingTaskId={draggingTaskId}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
