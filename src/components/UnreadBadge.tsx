interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className = "" }: UnreadBadgeProps) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold leading-none ${className}`}
      aria-label={`${count} messages non lus`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
