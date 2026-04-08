import { BOOK_STATUS } from '../constants/book'

export default function BookStatusBadge({ status }) {
  const meta = BOOK_STATUS[status]
  if (!meta) return null
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  )
}
