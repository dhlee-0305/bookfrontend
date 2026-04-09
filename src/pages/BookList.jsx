import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../hooks/useBooks'
import BookCard from '../components/BookCard'
import Toast from '../components/Toast'
import { BOOK_STATUS, GENRE_OPTIONS, SORT_OPTIONS, READ_STATUS_OPTIONS } from '../constants/book'
import { useAuth } from '../context/AuthContext'

const STATUS_TABS = [
  { value: '', label: '전체' },
  ...Object.entries(BOOK_STATUS).map(([value, { label }]) => ({ value, label })),
]

export default function BookList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    genre: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    readStatus: '',
  })

  const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  if (filters.readStatus && user?.email) {
    activeFilters.userName = user.email
  }

  const { data, isLoading, isError, error } = useBooks(activeFilters)

  const books = data?.data ?? []
  const total = data?.total ?? 0

  const handleToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">도서 목록</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-0.5">총 {total}권</p>
          )}
        </div>
        <button
          onClick={() => navigate('/books/new')}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium"
        >
          + 도서 등록
        </button>
      </div>

      {/* 상태 탭 필터 */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter('status', tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              filters.status === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 읽기 상태 필터 (로그인 시에만 표시) */}
      {user && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {READ_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter('readStatus', opt.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filters.readStatus === opt.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 검색 / 필터 바 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="제목, 저자, ISBN 검색..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <select
          value={filters.genre}
          onChange={(e) => setFilter('genre', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setFilter('order', filters.order === 'desc' ? 'asc' : 'desc')
            }
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
            title={filters.order === 'desc' ? '내림차순' : '오름차순'}
          >
            {filters.order === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* 목록 */}
      {isLoading && (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-500 text-sm">{error?.message}</div>
      )}

      {!isLoading && !isError && books.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-sm">등록된 도서가 없습니다.</p>
          <button
            onClick={() => navigate('/books/new')}
            className="mt-4 text-indigo-600 text-sm hover:underline"
          >
            첫 번째 도서를 등록해보세요
          </button>
        </div>
      )}

      {!isLoading && !isError && books.length > 0 && (
        <div className="grid gap-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onToast={handleToast} />
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
