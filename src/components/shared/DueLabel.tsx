import { getDueLabel } from '../../utils/date';

interface Props {
  dueDate: string;
}

export function DueLabel({ dueDate }: Props) {
  const { label, variant } = getDueLabel(dueDate);

  const color =
    variant === 'overdue' ? '#e24b4a' :
    variant === 'today'   ? '#ef9f27' :
                            '#5c5b72';

  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: 'DM Mono, monospace',
        color,
        fontWeight: variant === 'today' ? 500 : 400,
      }}
    >
      {label}
    </span>
  );
}
