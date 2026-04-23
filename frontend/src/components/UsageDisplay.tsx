import type { UsageStats } from '../types';

interface Props {
  usage: UsageStats | null;
}

export default function UsageDisplay({ usage }: Props) {
  if (!usage) return null;

  const isLow = usage.remaining <= 5;
  const isVeryLow = usage.remaining <= 2;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm ${
      isVeryLow
        ? 'bg-red-100 text-red-700'
        : isLow
          ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-600'
    }`}>
      <div className="flex items-center space-x-1">
        <span className="font-medium">{usage.remaining}</span>
        <span className="text-xs">/ {usage.limit}</span>
      </div>
      <span className="text-xs">queries left today</span>
      {usage.role === 'premium' && (
        <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded">PRO</span>
      )}
    </div>
  );
}
