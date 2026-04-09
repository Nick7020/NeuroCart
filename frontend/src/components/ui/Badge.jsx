import { STATUS_COLORS } from '../../utils'

export function Badge({ status }) {
  return (
    <span className={`badge ${STATUS_COLORS[status] || 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}
