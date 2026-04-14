import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useBook, useCreateBook, useUpdateBook } from '../hooks/useBooks'
import { BOOK_STATUS_OPTIONS, GENRE_OPTIONS } from '../constants/book'
import Toast from '../components/Toast'

const KAKAO_API_KEY = '4cfd15ad1eb6a00389c157129df7f245'

const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  author: z.string().min(1, '저자를 입력해주세요.'),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  genre: z.string().optional(),
  coverUrl: z.string().url('올바른 URL을 입력해주세요.').or(z.literal('')).optional(),
  purchaseDate: z.string().optional(),
  status: z.string().min(1),
})

const GENRE_SELECT_OPTIONS = GENRE_OPTIONS.filter((o) => o.value !== '')

export default function BookForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [toast, setToast] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [kakaoResults, setKakaoResults] = useState(null)

  const { data: bookData, isLoading: loadingBook } = useBook(id)
  const { mutate: createBook, isPending: creating } = useCreateBook()
  const { mutate: updateBook, isPending: updating } = useUpdateBook()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'OWNED' },
  })

  const coverValue = watch('coverUrl')

  const searchKakaoBook = async (title, author, publisher) => {
    const query = [title, author, publisher].filter(Boolean).join(' ')
    console.log('[카카오 검색] 시작:', query)
    try {
      const res = await axios.get('/kakao/v3/search/book', {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        params: { query, size: 10 },
      })
      console.log('[카카오 검색] 응답:', res.data)
      const documents = res.data.documents ?? []
      if (documents.length > 0) {
        setKakaoResults(documents)
      } else {
        console.log('[카카오 검색] 결과 없음')
      }
    } catch (err) {
      console.error('[카카오 검색] 오류:', err?.response?.status, err?.response?.data ?? err?.message)
    }
  }

  useEffect(() => {
    if (isEdit && bookData?.data) {
      const b = bookData.data
      reset({
        title: b.title ?? '',
        author: b.author ?? '',
        publisher: b.publisher ?? '',
        isbn: b.isbn ?? '',
        genre: b.genre ?? '',
        coverUrl: b.coverUrl ?? '',
        purchaseDate: b.purchaseDate ? new Date(b.purchaseDate).toISOString().slice(0, 10) : '',
        status: b.status ?? 'OWNED',
      })
      setPreviewUrl(b.coverUrl ?? '')

      console.log('[카카오 검색] isbn:', b.isbn, '/ coverUrl:', b.coverUrl)
      if (!b.isbn || !b.coverUrl) {
        searchKakaoBook(b.title, b.author, b.publisher)
      } else {
        console.log('[카카오 검색] isbn과 coverUrl이 모두 있어 검색 생략')
      }
    }
  }, [isEdit, bookData, reset])

  useEffect(() => {
    try {
      new URL(coverValue)
      setPreviewUrl(coverValue)
    } catch {
      setPreviewUrl('')
    }
  }, [coverValue])

  const handleKakaoSelect = (item) => {
    setValue('isbn', item.isbn ?? '')
    const thumbnail = item.thumbnail ?? ''
    setValue('coverUrl', thumbnail)
    if (thumbnail) setPreviewUrl(thumbnail)
    setKakaoResults(null)
  }

  const onSubmit = (formData) => {
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== ''),
    )
    if (isEdit) {
      updateBook(
        { id, data: payload },
        {
          onSuccess: () => {
            setToast({ message: '도서가 수정되었습니다.', type: 'success' })
            setTimeout(() => navigate(`/books/${id}`), 1200)
          },
          onError: (e) => setToast({ message: e.message, type: 'error' }),
        },
      )
    } else {
      createBook(payload, {
        onSuccess: () => {
          setToast({ message: '도서가 등록되었습니다.', type: 'success' })
          setTimeout(() => navigate('/books'), 1200)
        },
        onError: (e) => setToast({ message: e.message, type: 'error' }),
      })
    }
  }

  if (isEdit && loadingBook) {
    return <div className="text-center py-20 text-gray-400 text-sm">불러오는 중...</div>
  }

  const isPending = creating || updating

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '도서 수정' : '도서 등록'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* 표지 미리보기 */}
        {previewUrl && (
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="표지 미리보기"
              className="h-36 object-contain rounded shadow"
              onError={() => setPreviewUrl('')}
            />
          </div>
        )}

        <Field label="제목 *" error={errors.title?.message}>
          <input
            {...register('title')}
            placeholder="책 제목"
            className={input(errors.title)}
          />
        </Field>

        <Field label="저자 *" error={errors.author?.message}>
          <input
            {...register('author')}
            placeholder="저자명"
            className={input(errors.author)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="출판사" error={errors.publisher?.message}>
            <input
              {...register('publisher')}
              placeholder="출판사"
              className={input(errors.publisher)}
            />
          </Field>

          <Field label="ISBN" error={errors.isbn?.message}>
            <input
              {...register('isbn')}
              placeholder="ISBN"
              className={input(errors.isbn)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="장르" error={errors.genre?.message}>
            <select {...register('genre')} className={input(errors.genre)}>
              <option value="">선택 안함</option>
              {GENRE_SELECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="상태" error={errors.status?.message}>
            <select {...register('status')} className={input(errors.status)}>
              {BOOK_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="구입일" error={errors.purchaseDate?.message}>
          <input
            type="date"
            {...register('purchaseDate')}
            className={input(errors.purchaseDate)}
          />
        </Field>

        <Field label="표지 이미지 URL" error={errors.coverUrl?.message}>
          <input
            {...register('coverUrl')}
            placeholder="https://..."
            className={input(errors.coverUrl)}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {kakaoResults && (
        <KakaoBookSearchModal
          results={kakaoResults}
          onSelect={handleKakaoSelect}
          onClose={() => setKakaoResults(null)}
        />
      )}
    </div>
  )
}

function KakaoBookSearchModal({ results, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">카카오 도서 검색 결과</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
          >
            ×
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 flex-shrink-0">
          도서를 클릭하면 ISBN과 표지 이미지 URL이 자동으로 입력됩니다.
        </p>
        <div className="overflow-y-auto divide-y divide-gray-100">
          {results.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full flex gap-3 p-4 text-left hover:bg-indigo-50 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-16">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-xl">
                    📖
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.authors?.join(', ')}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.publisher}</p>
                {item.isbn && (
                  <p className="text-xs text-gray-400 mt-0.5">ISBN: {item.isbn}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function input(error) {
  return `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
    error ? 'border-red-400' : 'border-gray-200'
  }`
}
