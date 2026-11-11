import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocument, useSaveDocument } from '../hooks/useDocuments'
import { DOCUMENT_CATEGORIES, validateDocument, validateDocumentEncoding } from '../utils/document'

export default function DocumentForm() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  if (user === undefined) return <p role="status">로그인 확인 중...</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <DocumentLoader key={id ?? 'new'} id={id} />
}

function DocumentLoader({ id }) {
  const { data, isPending, error, refetch } = useDocument(id)
  if (id && isPending) return <p role="status">문서를 불러오는 중...</p>
  if (id && error) return <div role="alert"><p className="text-red-600 mb-4">{error.message}</p><button onClick={() => refetch()} className="mr-4 underline">다시 시도</button><Link to="/board">목록으로</Link></div>
  return <Editor id={id} document={data?.data} />
}

function Editor({ id, document }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => ({ category: document?.category ?? 'AI', file: null, images: null }))
  const [validating, setValidating] = useState(false)
  const submitting = useRef(false)
  const fileInput = useRef(null)
  const imagesInput = useRef(null)
  const [error, setError] = useState('')
  const save = useSaveDocument(id)
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const cancelUrl = id ? `/board/${id}` : '/board'
  const busy = validating || save.isPending
  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    const message = validateDocument(form, !!id)
    setError(message)
    if (message) return
    if (id && !form.file && !form.images && form.category === document.category) {
      setError('카테고리를 변경하거나 Markdown 파일 또는 이미지 ZIP을 선택해주세요.')
      return
    }
    submitting.current = true
    setValidating(true)
    try {
      if (form.file) {
        const encodingError = await validateDocumentEncoding(form.file)
        if (encodingError) {
          setError(encodingError)
          return
        }
      }
      const res = await save.mutateAsync(form)
      navigate(`/board/${res.data.id}`, { replace: true, state: location.state })
    } catch (err) {
      setError(err.message ?? '파일을 업로드하지 못했습니다.')
    } finally {
      submitting.current = false
      setValidating(false)
    }
  }
  const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400'
  return <div>
    <h1 className="text-2xl font-bold mb-6">{id ? '문서 수정' : '문서 등록'}</h1>
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
      <fieldset disabled={busy} className="space-y-5">
        <div><label htmlFor="document-category" className="block text-sm font-medium mb-1">카테고리</label><select id="document-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={input}>{DOCUMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
        {document && <div className="rounded-lg bg-gray-50 p-4 text-sm"><p className="font-medium break-all">현재 파일: {document.title}</p><p className="text-gray-500 mt-1">{document.size.toLocaleString()} B</p></div>}
        <div>
          <label htmlFor="document-file" className="block text-sm font-medium mb-2">{id ? '교체할 Markdown 파일 (선택)' : 'Markdown 파일'}</label>
          <input ref={fileInput} id="document-file" type="file" accept=".md" required={!id} aria-describedby="file-help" onChange={(event) => { set('file', event.target.files?.[0] ?? null); setError('') }} className={input} />
          <p id="file-help" className="mt-2 text-xs text-gray-500">UTF-8 .md 파일 한 개, 최대 10MB. 빈 파일도 업로드할 수 있습니다. 원본 파일명이 문서 제목이 됩니다.</p>
          <p className="mt-1 text-xs text-gray-500">파일명은 최대 240 UTF-8 바이트이며 같은 카테고리에서 중복할 수 없습니다.</p>
          {id && <p className="mt-1 text-xs text-gray-500">Markdown 파일을 선택하지 않으면 기존 문서 내용을 유지합니다. 제목 변경은 변경된 이름의 파일을 업로드해주세요.</p>}
          {form.file && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span className="break-all">선택 파일: {form.file.name} ({form.file.size.toLocaleString()} B)</span><button type="button" className="text-indigo-600" onClick={() => { set('file', null); fileInput.current.value = ''; setError('') }}>선택 취소</button></div>}
        </div>
        <div>
          <label htmlFor="document-images" className="block text-sm font-medium mb-2">이미지 ZIP (선택)</label>
          <input ref={imagesInput} id="document-images" type="file" accept=".zip" aria-describedby="images-help" onChange={(event) => { set('images', event.target.files?.[0] ?? null); setError('') }} className={input} />
          <div id="images-help" className="mt-2 space-y-1 text-xs text-gray-500">
            <p>이미지 ZIP 한 개, 최대 10MB. 이미지 파일과 하위 폴더를 ZIP 루트에 배치하세요.</p>
            <p>지원 형식: PNG, JPG, JPEG, GIF, WEBP, AVIF, BMP, ICO, SVG. 압축 해제 후 최대 100MB, 파일·폴더 합계 1,000개까지 지원합니다.</p>
            <p>ZIP 안의 도표/구성.png는 Markdown에서 ![구성](image/도표/구성.png)로 참조하세요. ZIP에 image 폴더를 별도로 넣지 마세요.</p>
            {id && <p>ZIP을 첨부하지 않으면 기존 이미지를 유지합니다. 빈 ZIP을 첨부하면 이미지를 모두 삭제합니다.</p>}
          </div>
          {form.images && <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm"><span className="break-all">선택 ZIP: {form.images.name} ({form.images.size.toLocaleString()} B)</span><button type="button" className="text-indigo-600" onClick={() => { set('images', null); imagesInput.current.value = ''; setError('') }}>선택 취소</button></div>
            {id && <p className="text-sm text-amber-700">저장하면 기존 이미지가 모두 삭제되고 선택한 ZIP의 이미지로 전체 교체됩니다.</p>}
          </div>}
        </div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => navigate(cancelUrl, { state: location.state })} className="px-5 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50">취소</button><button disabled={busy} type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50">{busy ? '업로드 중...' : id ? '수정 완료' : '등록'}</button></div>
    </form>
  </div>
}
