type StatusBadgeProps = {
  status: string | null | undefined
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = (status || '').toLowerCase()

  let style = 'bg-gray-100 text-gray-700'
  if (s === 'lost') style = 'bg-orange-100 text-orange-800'
  else if (s === 'found') style = 'bg-teal-100 text-teal-800'
  else if (s === 'returned') style = 'bg-gray-100 text-gray-700'

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>{label}</span>
  )
}
