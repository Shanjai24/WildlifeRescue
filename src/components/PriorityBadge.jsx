export default function PriorityBadge({ value }) {
  const badgeClass = {
    critical: 'badge-danger',
    medium: 'badge-warning',
    low: 'badge-success',
  }[value] || 'badge-neutral';

  return (
    <span className={`badge ${badgeClass} capitalize font-semibold`}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} className="mr-1"></span>
      {value}
    </span>
  );
}
