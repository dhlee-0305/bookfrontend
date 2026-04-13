import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBook, useCreateBook, useUpdateBook } from '../hooks/useBooks'
import { BOOK_STATUS_OPTIONS, GENRE_OPTIONS } from '../constants/book'
import Toast from '../components/Toast'

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

  const { data: bookData, isLoading: loadingBook } = useBook(id)
  const { mutate: createBook, isPending: creating } = useCreateBook()
  const { mutate: updateBook, isPending: updating } = useUpdateBook()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'OWNED' },
  })

  const coverValue = watch('coverUrl')

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
        purchaseDate: b.purchaseDate ?? '',
        status: b.status ?? 'OWNED',
      })
      setPreviewUrl(b.coverUrl ?? '')
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
