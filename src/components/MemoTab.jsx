import { useState } from 'react'
import { useMemos, useCreateMemo, useUpdateMemo, useDeleteMemo } from '../hooks/useMemos'

function MemoForm({ bookId, initial, onDone }) {
  const isEdit = !!initial
  const [content, setContent] = useState(initial?.content ?? '')
  const [page, setPage] = useState(initial?.page ?? '')

  const { mutate: create, isPending: creating } = useCreateMemo(bookId)
  const { mutate: update, isPending: updating } = useUpdateMemo(bookId)
  const isPending = creating || updating

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { content }
    if (page !== '' && !isNaN(Number(page))) payload.page = Number(page)

    if (isEdit) {
      update({ id: initial.id, data: payload }, { onSuccess: onDone })
    } else {
      create(payload, { onSuccess: onDone })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">내용 *</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="기억하고 싶은 문장, 생각, 인사이트를 남겨보세요..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray-600 mb-1">페이지</label>
          <input
            type="number"
            min={1}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="p."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
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
          {isPending ? '저장 중...' : isEdit ? '수정 완료' : '메모 추가'}
        </button>
      </div>
    </form>
  )
}

function MemoItem({ bookId, memo, onToast }) {
  const [editing, setEditing] = useState(false)
  const { mutate: del, isPending: deleting } = useDeleteMemo(bookId)

  const handleDelete = () => {
    del(memo.id, {
      onSuccess: () => onToast?.('메모가 삭제되었습니다.', 'success'),
      onError: (e) => onToast?.(e.message, 'error'),
    })
  }

  if (editing) {
    return (
      <MemoForm
        bookId={bookId}
        initial={memo}
        onDone={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {memo.page && (
          <span className="flex-shrink-0 text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded font-medium">
            p.{memo.page}
          </span>
        )}
        <p className="flex-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {memo.content}
        </p>
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
      {memo.createdAt && (
        <p className="text-xs text-gray-400 mt-2 text-right">
          {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
        </p>
      )}
    </div>
  )
}

export default function MemoTab({ bookId, onToast }) {
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, isError, error } = useMemos(bookId)
  const memos = data?.data ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{memos.length}개의 메모</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + 메모 추가
          </button>
        )}
      </div>

      {showForm && (
        <MemoForm
          bookId={bookId}
          onDone={() => setShowForm(false)}
        />
      )}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-8 text-red-400 text-sm">{error?.message}</div>
      )}

      {!isLoading && !isError && memos.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          <p className="text-3xl mb-2">✏️</p>
          <p>아직 메모가 없습니다.</p>
        </div>
      )}

      {memos.map((m) => (
        <MemoItem key={m.id} bookId={bookId} memo={m} onToast={onToast} />
      ))}
    </div>
  )
}
