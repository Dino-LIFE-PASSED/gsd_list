export default function TagBadge({ label, color, size = 'sm' }) {
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5'
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${color}`}>
      {label}
    </span>
  )
}
