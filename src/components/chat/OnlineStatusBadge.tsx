import { Badge } from '@/components/ui/badge';

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function OnlineStatusBadge({ isOnline, size = 'md', showText = false }: OnlineStatusBadgeProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (showText) {
    return (
      <Badge variant={isOnline ? 'default' : 'secondary'} className="gap-1.5">
        <span className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    );
  }

  return (
    <span 
      className={`${sizeClasses[size]} rounded-full border-2 border-background ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
