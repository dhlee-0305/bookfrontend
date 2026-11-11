import { Link, useLocation, useParams } from 'react-router-dom'
import { useDocument } from '../hooks/useDocuments'
import { useAuth } from '../context/AuthContext'
import { formatDocumentDate } from '../utils/document'
import DocumentContent from '../components/DocumentContent'

export default function DocumentDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { data, isPending, error, refetch } = useDocument(id)
  const listSearch = location.state?.listSearch
  const listUrl = `/board${listSearch ? `?${listSearch}` : ''}`
  if (isPending) return <p role="status" className="py-16 text-center text-gray-500">불러오는 중...</p>
  if (error) return <div role="alert" className="space-y-4"><p className="text-red-600">{error.message}</p><button onClick={() => refetch()} className="mr-4 underline">다시 시도</button><Link to={listUrl} className="text-indigo-600">목록으로</Link></div>
  const doc = data.data
  return <div>
    <div className="flex justify-between items-center mb-5"><Link to={listUrl} className="text-sm text-gray-500">← 목록으로</Link>{user && <Link to={`/board/${id}/edit`} state={location.state} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg">문서 수정</Link>}</div>
    <article className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8">
      <span className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1">{doc.category}</span>
      <h1 className="text-2xl font-bold mt-3 break-all">{doc.title}</h1>
      <div className="text-xs text-gray-500 mt-3 mb-6 flex flex-wrap gap-3"><span>등록 {formatDocumentDate(doc.createdAt)}</span><span>수정 {formatDocumentDate(doc.updatedAt)}</span><span>{doc.size.toLocaleString()} B</span></div>
      <DocumentContent content={doc.content} />
    </article>
  </div>
}
