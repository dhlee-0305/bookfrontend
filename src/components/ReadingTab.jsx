import { useState } from 'react'
import { useReadings, useCreateReading, useUpdateReading, useDeleteReading } from '../hooks/useReadings'
import { useAuth } from '../context/AuthContext'
import { READ_STATUS_OPTIONS } from '../constants/book'

const STAR_LABELS = ['', '별로', '보통', '괜찮음', '좋음', '최고']
const READ_STATUS_LABELS = {
  READ: '읽음',
  EXCLUDED: '읽기 제외',
}

function formatDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('ko-KR')
}


function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0)
  const display = readOnly ? value : hovered || value

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(n === value ? 0 : n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`text-xl leading-none transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${n <= display ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
      {!readOnly && display > 0 && (
        <span className="ml-1 text-xs text-gray-400 self-center">{STAR_LABELS[display]}</span>
      )}
    </div>
  )
}

function ReadingForm({ bookId, initial, onDone }) {
  const isEdit = !!initial
  const { user } = useAuth()
  const [form, setForm] = useState({
    userName: initial?.userName ?? '',
    readStatus: initial?.readStatus ?? 'READ',
    rating: initial?.rating ?? 0,
    review: initial?.review ?? '',
  })

  const { mutate: create, isPending: creating } = useCreateReading(bookId)
  const { mutate: update, isPending: updating } = useUpdateReading(bookId)
  const isPending = creating || updating

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== 0),
    )

    if (isEdit) {
      update({ id: initial.id, data: payload }, { onSuccess: onDone })
      return
    }

    create(payload, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">사용자명 *</label>
        <input
          type="text"
          required
          value={form.userName}
          onChange={(e) => set('userName', e.target.value)}
          placeholder={user?.email ?? '이름을 입력하세요'}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">읽기 상태</label>
        <select
          value={form.readStatus}
          onChange={(e) => set('readStatus', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          {READ_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">별점</label>
        <StarRating value={form.rating} onChange={(v) => set('rating', v)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">독서 감상</label>
        <textarea
          value={form.review}
          onChange={(e) => set('review', e.target.value)}
          placeholder="이 책에 대한 감상을 적어보세요."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? '저장 중...' : isEdit ? '수정 완료' : '기록 추가'}
        </button>
      </div>
    </form>
  )
}

function ReadingItem({ bookId, reading, onToast }) {
  const [editing, setEditing] = useState(false)
  const { mutate: del, isPending: deleting } = useDeleteReading(bookId)
  const readStatusLabel = READ_STATUS_LABELS[reading.readStatus]
  const readDate = formatDate(reading.createdAt)

  const handleDelete = () => {
    del(reading.id, {
      onSuccess: () => onToast?.('독서 기록이 삭제되었습니다.', 'success'),
      onError: (e) => onToast?.(e.message, 'error'),
    })
  }

  if (editing) {
    return (
      <ReadingForm
        bookId={bookId}
        initial={reading}
        onDone={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {reading.userName && (
              <span className="text-sm font-semibold text-indigo-700">
                {reading.userName}
              </span>
            )}
            {reading.createdAt && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{readStatusLabel ? `${readStatusLabel} ` : ''}</span>
            )}
          </div>
          {readDate && (
            <p className="text-sm text-gray-500">날짜: {readDate}</p>
          )}
          {reading.rating > 0 && <StarRating value={reading.rating} readOnly />}
          {reading.review && (
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{reading.review}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 hover:underline"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:underline disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReadingTab({ bookId, onToast }) {
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, isError, error } = useReadings(bookId)
  const readings = data?.data ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{readings.length}개의 기록</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + 기록 추가
          </button>
        )}
      </div>

      {showForm && <ReadingForm bookId={bookId} onDone={() => setShowForm(false)} />}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && <div className="text-center py-8 text-red-400 text-sm">{error?.message}</div>}

      {!isLoading && !isError && readings.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          <p className="text-3xl mb-2">📚</p>
          <p>아직 독서 기록이 없습니다.</p>
        </div>
      )}

      {readings.map((r) => (
        <ReadingItem key={r.id} bookId={bookId} reading={r} onToast={onToast} />
      ))}
    </div>
  )
}
