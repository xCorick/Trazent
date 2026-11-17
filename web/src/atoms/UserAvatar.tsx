import { Avatar } from 'antd';
import { colors } from '@/theme/tokens';
import { initials } from '@/utils/format';

interface UserAvatarProps {
  name: string;
  size?: number;
  variant?: 'solid' | 'soft';
}

export function UserAvatar({ name, size = 36, variant = 'soft' }: UserAvatarProps) {
  const solid = variant === 'solid';
  return (
    <Avatar
      size={size}
      style={{
        backgroundColor: solid ? colors.blue700 : colors.blue50,
        color: solid ? colors.white : colors.blue700,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </Avatar>
  );
}
