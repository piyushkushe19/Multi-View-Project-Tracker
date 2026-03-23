import { useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PRIORITY_COLORS } from '../../types';
import { getDaysInMonth, isoYearMonth, isoToMonthDay } from '../../utils/date';
import type { Task } from '../../types';

const DAY_W   = 38;
const ROW_H   = 50;
const LABEL_W = 230;

function getTodayInfo() {
  const now   = new Date();
  return {
    year:    now.getFullYear(),
    month:   now.getMonth(),
    day:     now.getDate(),
    label:   now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    monthStr: now.toISOString().slice(0, 7),
  };
}

interface DayMeta {
  n: number;
  dayLabel: string;
  isWeekend: boolean;
  isToday: boolean;
}

function buildDays(year: number, month: number, todayDay: number): DayMeta[] {
  const count = getDaysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      n: i + 1,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: i + 1 === todayDay,
    };
  });
}

interface TaskBarProps {
  task: Task;
  monthStr: string;
  totalDays: number;
}

function TaskBar({ task, monthStr, totalDays }: TaskBarProps) {
  const color = PRIORITY_COLORS[task.priority];

  const dueInMonth  = isoYearMonth(task.dueDate) === monthStr;
  const startInMonth = task.startDate && isoYearMonth(task.startDate) === monthStr;

  let left: number, width: number;

  if (startInMonth && dueInMonth && task.startDate) {
    const startDay = isoToMonthDay(task.startDate);
    const endDay   = isoToMonthDay(task.dueDate);
    left  = (startDay - 1) * DAY_W;
    width = Math.max((endDay - startDay + 1) * DAY_W, DAY_W);
  } else if (dueInMonth) {
    const endDay = isoToMonthDay(task.dueDate);
    left  = (endDay - 1) * DAY_W;
    width = DAY_W;
  } else if (startInMonth && task.startDate) {
    const startDay = isoToMonthDay(task.startDate);
    left  = (startDay - 1) * DAY_W;
    width = (totalDays - startDay + 1) * DAY_W;
  } else {
    // Task entirely outside month — render faint full-width bar
    left  = 0;
    width = totalDays * DAY_W;
  }

  const showLabel = width > 56;

  return (
    <div
      title={task.title}
      style={{
        position: 'absolute',
        left,
        width,
        height: 30,
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 6,
        background: color + '25',
        border: `1px solid ${color}55`,
        color,
        fontSize: 10,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 8,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        zIndex: 2,
        cursor: 'default',
      }}
    >
      {showLabel && task.title.slice(0, Math.floor(width / 7))}
    </div>
  );
}

export function TimelineView() {
  const getFilteredTasks = useAppStore(s => s.getFilteredTasks);
  const tasks = getFilteredTasks();

  const gridScrollRef  = useRef<HTMLDivElement>(null);
  const labelScrollRef = useRef<HTMLDivElement>(null);
  const headScrollRef  = useRef<HTMLDivElement>(null);

  const { year, month, day, label, monthStr } = getTodayInfo();
  const days = buildDays(year, month, day);
  const totalW = days.length * DAY_W;
  const todayLineLeft = (day - 1) * DAY_W + DAY_W / 2;

  const onGridScroll = useCallback(() => {
    if (!gridScrollRef.current) return;
    const { scrollTop, scrollLeft } = gridScrollRef.current;
    if (labelScrollRef.current) labelScrollRef.current.scrollTop = scrollTop;
    if (headScrollRef.current)  headScrollRef.current.scrollLeft = scrollLeft;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header row */}
      <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--border-dim)' }}>
        {/* Month label */}
        <div
          style={{
            width: LABEL_W,
            minWidth: LABEL_W,
            flexShrink: 0,
            borderRight: '1px solid var(--border-dim)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text2)',
            fontFamily: 'Syne, sans-serif',
          }}
        >
          {label}
        </div>
        {/* Day header — synced scroll */}
        <div
          ref={headScrollRef}
          style={{ flex: 1, overflowX: 'hidden', display: 'flex' }}
        >
          <div style={{ display: 'flex', minWidth: totalW }}>
            {days.map(d => (
              <div
                key={d.n}
                style={{
                  width: DAY_W,
                  minWidth: DAY_W,
                  textAlign: 'center',
                  padding: '4px 0',
                  borderRight: '1px solid var(--border-dim)',
                  fontSize: 9,
                  fontFamily: 'DM Mono, monospace',
                  color: d.isToday
                    ? 'var(--accent-light)'
                    : d.isWeekend
                    ? 'var(--text3)'
                    : 'var(--text3)',
                  fontWeight: d.isToday ? 500 : 400,
                  opacity: d.isWeekend && !d.isToday ? 0.5 : 1,
                  background: d.isToday ? 'rgba(111,93,231,0.08)' : 'transparent',
                }}
              >
                <div>{d.dayLabel}</div>
                <div style={{ fontSize: 11, marginTop: 1 }}>{d.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Task labels (left pane) */}
        <div
          ref={labelScrollRef}
          style={{
            width: LABEL_W,
            minWidth: LABEL_W,
            flexShrink: 0,
            borderRight: '1px solid var(--border-dim)',
            overflowY: 'hidden',
          }}
        >
          {tasks.map(task => (
            <div
              key={task.id}
              style={{
                height: ROW_H,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-dim)',
                fontSize: 12,
                color: 'var(--text2)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={task.title}
            >
              {task.title}
            </div>
          ))}
        </div>

        {/* Scrollable grid */}
        <div
          ref={gridScrollRef}
          onScroll={onGridScroll}
          style={{ flex: 1, overflow: 'auto' }}
        >
          {tasks.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: 'var(--text3)',
                fontSize: 13,
              }}
            >
              No tasks visible for the current month
            </div>
          ) : (
            <div style={{ minWidth: totalW, position: 'relative' }}>
              {/* Today vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: todayLineLeft,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'var(--accent)',
                  opacity: 0.5,
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              />
              {tasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    height: ROW_H,
                    position: 'relative',
                    borderBottom: '1px solid var(--border-dim)',
                    display: 'flex',
                  }}
                >
                  {/* Cell backgrounds */}
                  {days.map(d => (
                    <div
                      key={d.n}
                      style={{
                        width: DAY_W,
                        minWidth: DAY_W,
                        flexShrink: 0,
                        height: '100%',
                        borderRight: '1px solid var(--border-dim)',
                        background: d.isToday
                          ? 'rgba(111,93,231,0.05)'
                          : d.isWeekend
                          ? 'rgba(255,255,255,0.01)'
                          : 'transparent',
                      }}
                    />
                  ))}
                  <TaskBar task={task} monthStr={monthStr} totalDays={days.length} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
