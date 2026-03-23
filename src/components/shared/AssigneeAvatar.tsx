import type { User } from '../../types';

interface Props {
  user: User;
  size?: number;
}

export function AssigneeAvatar({ user, size = 24 }: Props) {
  return (
    <div
      title={user.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: user.color + '22',
        color: user.color,
        border: `1.5px solid ${user.color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontFamily: 'DM Mono, monospace',
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {user.initials}
    </div>
  );
}
