import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookStatusBadge from './BookStatusBadge'
import ConfirmModal from './ConfirmModal'
import { useDeleteBook, useUpdateBook } from '../hooks/useBooks'
import { BOOK_STATUS_OPTIONS } from '../constants/book'

const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toISOString().slice(0, 10)
}

export default function BookCard({ book, onToast, page, limit }) {
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const { mutate: deleteBook, isPending: deleting } = useDeleteBook()
  const { mutate: updateBook } = useUpdateBook()

  const handleDelete = () => {
    deleteBook(book.id, {
      onSuccess: () => {
        setShowDelete(false)
        onToast?.('도서가 삭제되었습니다.', 'success')
      },
      onError: (e) => onToast?.(e.message, 'error'),
    })
  }

  const handleStatusChange = (e) => {
    updateBook(
      { id: book.id, data: { ...book, status: e.target.value } },
      {
        onSuccess: () => onToast?.('상태가 변경되었습니다.', 'success'),
        onError: (e) => onToast?.(e.message, 'error'),
      },
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
        {/* 표지 이미지 */}
        <div className="flex-shrink-0 w-16 h-22">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-16 h-22 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-22 bg-gray-100 rounded flex items-center justify-center text-2xl">
              📖
            </div>
          )}
        </div>

        {/* 도서 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => navigate(`/books/${book.id}`, { state: { page, limit } })}
              className="text-left text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate"
            >
              {book.title}
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookStatusBadge status={book.status} />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {book.author} · {book.publisher}
          </p>
          {book.genre && (
            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {book.genre}
            </span>
          )}
          {book.purchaseDate && (
            <p className="text-xs text-gray-400 mt-1">구입일: {formatDate(book.purchaseDate)}</p>
          )}

          {/* 상태 변경 + 액션 버튼 */}
          <div className="mt-3 flex items-center gap-2">
            <select
              value={book.status}
              onChange={handleStatusChange}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {BOOK_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate(`/books/${book.id}/edit`)}
              className="text-xs text-indigo-600 hover:underline"
            >
              수정
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs text-red-500 hover:underline"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      {showDelete && (
        <ConfirmModal
          title="도서 삭제"
          message={`"${book.title}"을(를) 삭제하면 독서 기록과 메모도 함께 삭제됩니다. 계속하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </>
  )
}
