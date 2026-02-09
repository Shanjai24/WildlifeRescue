export default function PriorityBadge({ value }) {
  const badgeClass = {
    critical: 'badge-danger',
    medium: 'badge-warning',
    low: 'badge-success',
  }[value] || 'badge-neutral';

  const icon = {
    critical: '🚨',
    medium: '⚠️',
    low: '✅',
  }[value] || '•';

  return (
    <span className={`badge ${badgeClass} capitalize font-semibold`}>
      <span className="mr-1">{icon}</span>
      {value}
    </span>
  );
}
