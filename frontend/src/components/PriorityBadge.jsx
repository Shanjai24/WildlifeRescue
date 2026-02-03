export default function PriorityBadge({ value }) {
  const color = value === 'critical' ? 'bg-red-600' : value === 'medium' ? 'bg-yellow-500' : 'bg-green-600';
  return <span className={`text-white text-xs px-2 py-1 rounded ${color}`}>{value}</span>;
}
