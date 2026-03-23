import { useRef, useCallback } from 'react';
import type { Task, TaskStatus } from '../../types';

interface DragCallbacks {
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
}

interface DragState {
  taskId: string;
  sourceStatus: TaskStatus;
  ghostEl: HTMLDivElement | null;
  cloneEl: HTMLDivElement | null;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  overColStatus: TaskStatus | null;
}

// Returns the Kanban column element + its status at a given point
function getColAtPoint(x: number, y: number): { el: HTMLElement; status: TaskStatus } | null {
  const cols = document.querySelectorAll<HTMLElement>('[data-kanban-col]');
  for (const col of cols) {
    const r = col.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return { el: col, status: col.dataset.kanbanCol as TaskStatus };
    }
  }
  return null;
}

// Find insert position within a column body
function getInsertTarget(
  bodyEl: HTMLElement,
  y: number
): { before: HTMLElement | null } {
  const cards = [...bodyEl.querySelectorAll<HTMLElement>('[data-task-id]:not([data-ghost])')];
  for (const card of cards) {
    const r = card.getBoundingClientRect();
    if (y < r.top + r.height / 2) return { before: card };
  }
  return { before: null };
}

export function useDragAndDrop({ onDrop }: DragCallbacks) {
  const dragRef = useRef<DragState | null>(null);

  const startDrag = useCallback((
    e: React.PointerEvent,
    task: Task,
    cardEl: HTMLDivElement,
  ) => {
    e.preventDefault();

    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // ── 1. Ghost placeholder (same height — no layout shift) ──────────────
    const ghost = document.createElement('div');
    ghost.dataset.ghost = 'true';
    ghost.style.cssText = `
      height: ${rect.height}px;
      border-radius: 8px;
      background: rgba(111,93,231,0.08);
      border: 1.5px dashed rgba(111,93,231,0.4);
      flex-shrink: 0;
      pointer-events: none;
      transition: none;
    `;
    cardEl.parentNode!.insertBefore(ghost, cardEl);

    // ── 2. Floating clone ─────────────────────────────────────────────────
    const clone = cardEl.cloneNode(true) as HTMLDivElement;
    clone.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      top: ${rect.top}px;
      left: ${rect.left}px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0.92;
      box-shadow: 0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(111,93,231,0.5);
      border-radius: 8px;
      transform: rotate(1.5deg) scale(1.02);
      transition: box-shadow 0.1s, transform 0.1s;
      cursor: grabbing;
      background: var(--bg3);
      padding: 12px;
      border: 1px solid rgba(111,93,231,0.5);
    `;
    document.body.appendChild(clone);

    dragRef.current = {
      taskId: task.id,
      sourceStatus: task.status,
      ghostEl: ghost,
      cloneEl: clone,
      offsetX,
      offsetY,
      pointerId: e.pointerId,
      overColStatus: null,
    };

    // Mark original card
    cardEl.style.opacity = '0.25';

    const boardEl = document.getElementById('kanban-board')!;
    boardEl.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragRef.current;
    if (!ds || !ds.cloneEl || !ds.ghostEl) return;

    // Move clone
    ds.cloneEl.style.left = `${e.clientX - ds.offsetX}px`;
    ds.cloneEl.style.top  = `${e.clientY - ds.offsetY}px`;

    // Hit-test column
    const hit = getColAtPoint(e.clientX, e.clientY);

    // Remove previous highlight
    document.querySelectorAll<HTMLElement>('[data-kanban-col]').forEach(col => {
      col.style.borderColor = '';
      col.style.background  = '';
    });

    if (hit) {
      // Highlight drop zone
      hit.el.style.borderColor = 'rgba(111,93,231,0.6)';
      hit.el.style.background  = 'rgba(111,93,231,0.05)';

      // Move ghost into this column
      const body = hit.el.querySelector<HTMLElement>('[data-kanban-body]')!;
      const { before } = getInsertTarget(body, e.clientY);
      if (before) {
        body.insertBefore(ds.ghostEl, before);
      } else {
        body.appendChild(ds.ghostEl);
      }

      ds.overColStatus = hit.status;
    } else {
      ds.overColStatus = null;
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const ds = dragRef.current;
    if (!ds) return;

    // Restore original card opacity
    const originalCard = document.querySelector<HTMLElement>(
      `[data-task-id="${ds.taskId}"]`
    );
    if (originalCard) originalCard.style.opacity = '';

    // Clean up column highlights
    document.querySelectorAll<HTMLElement>('[data-kanban-col]').forEach(col => {
      col.style.borderColor = '';
      col.style.background  = '';
    });

    // Remove clone + ghost
    ds.cloneEl?.remove();
    ds.ghostEl?.remove();

    const boardEl = document.getElementById('kanban-board');
    try { boardEl?.releasePointerCapture(e.pointerId); } catch {}

    if (ds.overColStatus && ds.overColStatus !== ds.sourceStatus) {
      onDrop(ds.taskId, ds.overColStatus);
    }
    // If no valid target, card simply stays — "snap back" is just
    // the ghost being removed and original card reappearing

    dragRef.current = null;
  }, [onDrop]);

  const onPointerCancel = useCallback(() => {
    const ds = dragRef.current;
    if (!ds) return;
    const originalCard = document.querySelector<HTMLElement>(
      `[data-task-id="${ds.taskId}"]`
    );
    if (originalCard) originalCard.style.opacity = '';
    document.querySelectorAll<HTMLElement>('[data-kanban-col]').forEach(col => {
      col.style.borderColor = '';
      col.style.background  = '';
    });
    ds.cloneEl?.remove();
    ds.ghostEl?.remove();
    dragRef.current = null;
  }, []);

  return { startDrag, onPointerMove, onPointerUp, onPointerCancel };
}
