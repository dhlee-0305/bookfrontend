import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments'
import { DOCUMENT_CATEGORIES, formatDocumentDate } from '../utils/document'

export default function DocumentList() {
  const { user } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const deletion = useDeleteDocument()
  const [params, setParams] = useSearchParams()
  const rawPage = Number(params.get('page') ?? 1)
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 214748365 ? rawPage : 1
  const category = DOCUMENT_CATEGORIES.includes(params.get('category')) ? params.get('category') : ''
  const { data, isPending, isFetching, error, refetch } = useDocuments({ page, limit: 10, ...(category && { category }) })
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 10))
  const changePage = (next) => setParams({ ...(category && { category }), page: String(next) })

  useEffect(() => {
    if (data && !isFetching && !error && data.page === page && page > totalPages) {
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        next.set('page', String(totalPages))
        return next
      }, { replace: true })
    }
  }, [data, isFetching, error, page, totalPages, setParams])

  const handleDelete = () => {
    if (!deleteTarget || deletion.isPending) return
    deletion.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        setToast({ message: '문서가 삭제되었습니다.', type: 'success' })
      },
      onError: (err) => {
        setDeleteTarget(null)
        setToast({ message: err.message, type: 'error' })
      },
    })
  }


  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">문서 게시판</h1><p className="text-sm text-gray-500 mt-1">{data ? `총 ${data.total}개 문서` : '문서를 공유하고 관리하세요.'}</p></div>
        <Link to="/board/new" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm whitespace-nowrap">+ 문서 등록</Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-5" aria-label="카테고리 필터">
        {['', ...DOCUMENT_CATEGORIES].map((value) => <button key={value} aria-pressed={category === value} onClick={() => setParams(value ? { category: value } : {})} className={`px-4 py-2 rounded-lg text-sm ${category === value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{value || '전체'}</button>)}
      </div>
      {isPending ? <p role="status" className="py-16 text-center text-gray-500">불러오는 중...</p> : error ? <div role="alert" className="py-10 text-center text-red-600"><p>{error.message}</p><button onClick={() => refetch()} className="mt-3 underline">다시 시도</button></div> : <>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {data.data.length === 0 ? <p className="py-16 text-center text-gray-500">등록된 문서가 없습니다.</p> : (
            <ul className="divide-y divide-gray-100">
              {data.data.map((doc) => (
                <li key={doc.id} className="p-5 hover:bg-indigo-50">
                  <div className="flex items-start gap-3">
                    <Link to={`/board/${doc.id}`} state={{ listSearch: params.toString() }} className="flex min-w-0 flex-1 items-start gap-3 hover:text-indigo-600">
                      <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded shrink-0">{doc.category}</span>
                      <span className="font-medium break-all">{doc.title}</span>
                    </Link>
                    {user && (
                      <button type="button" disabled={deletion.isPending} onClick={() => setDeleteTarget(doc)} aria-label={`${doc.title} 문서 삭제`} className="shrink-0 rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                        문서 삭제
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">수정 {formatDocumentDate(doc.updatedAt)} · {doc.size.toLocaleString()} B</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="게시판 페이지" className="flex items-center justify-center gap-4 mt-6 text-sm">
          <button disabled={page <= 1} onClick={() => changePage(page - 1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">이전</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => changePage(page + 1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">다음</button>
        </nav>
      </>}
      {deleteTarget && <ConfirmModal title="문서 삭제" message={`"${deleteTarget.title}" 문서와 첨부 이미지를 모두 삭제하시겠습니까?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deletion.isPending} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
