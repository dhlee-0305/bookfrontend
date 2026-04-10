import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useBook, useDeleteBook } from '../hooks/useBooks'
import BookStatusBadge from '../components/BookStatusBadge'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import ReadingTab from '../components/ReadingTab'
import MemoTab from '../components/MemoTab'

const TABS = [
  { value: 'readings', label: '독서 기록' },
  { value: 'memos', label: '메모' },
]

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listState = location.state ?? {}
  const [showDelete, setShowDelete] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('readings')

  const { data, isLoading, isError, error } = useBook(id)
  const { mutate: deleteBook, isPending: deleting } = useDeleteBook()

  const book = data?.data

  const handleDelete = () => {
    deleteBook(id, {
      onSuccess: () => {
        setShowDelete(false)
        setToast({ message: '도서가 삭제되었습니다.', type: 'success' })
        setTimeout(() => navigate('/books', { state: listState }), 1200)
      },
      onError: (e) => setToast({ message: e.message, type: 'error' }),
    })
  }

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400 text-sm">불러오는 중...</div>
  }
  if (isError) {
    return <div className="text-center py-20 text-red-400 text-sm">{error?.message}</div>
  }
  if (!book) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* 상단 네비 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/books', { state: listState })}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{book.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/books/${id}/edit`)}
            className="px-3 py-1.5 text-sm border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            수정
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="px-3 py-1.5 text-sm border border-red-300 text-red-500 rounded-lg hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 도서 정보 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex gap-6">
        <div className="flex-shrink-0">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-24 h-32 object-cover rounded shadow"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-100 rounded flex items-center justify-center text-3xl shadow">
              📖
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <BookStatusBadge status={book.status} />
            {book.genre && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {book.genre}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{book.author}</p>
          {book.publisher && (
            <p className="text-sm text-gray-500">{book.publisher}</p>
          )}
          {book.isbn && (
            <p className="text-xs text-gray-400">ISBN: {book.isbn}</p>
          )}
          {book.purchaseDate && (
            <p className="text-xs text-gray-400">구입일: {new Date(book.purchaseDate).toISOString().slice(0, 10)}</p>
          )}
        </div>
      </div>

      {/* 독서 기록 & 메모 탭 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'readings' && (
            <ReadingTab bookId={id} onToast={(msg, type) => setToast({ message: msg, type })} />
          )}
          {activeTab === 'memos' && (
            <MemoTab bookId={id} onToast={(msg, type) => setToast({ message: msg, type })} />
          )}
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
