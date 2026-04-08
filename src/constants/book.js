export const BOOK_STATUS = {
  OWNED: { label: '소장 중', color: 'bg-blue-100 text-blue-700' },
  READING: { label: '읽는 중', color: 'bg-green-100 text-green-700' },
  DONE: { label: '완독', color: 'bg-purple-100 text-purple-700' },
  EXCLUDED: { label: '읽기 제외', color: 'bg-gray-100 text-gray-600' },
  SOLD: { label: '판매', color: 'bg-orange-100 text-orange-700' },
  DONATED: { label: '기부', color: 'bg-pink-100 text-pink-700' },
}

export const BOOK_STATUS_OPTIONS = Object.entries(BOOK_STATUS).map(
  ([value, { label }]) => ({ value, label }),
)

export const GENRE_OPTIONS = [
  { value: '', label: '전체 장르' },
  { value: '소설', label: '소설' },
  { value: '자기계발', label: '자기계발' },
  { value: '경제/경영', label: '경제/경영' },
  { value: '인문', label: '인문' },
  { value: '역사', label: '역사' },
  { value: '과학', label: '과학' },
  { value: '기술/IT', label: '기술/IT' },
  { value: '예술', label: '예술' },
  { value: '사회', label: '사회' },
  { value: '기타', label: '기타' },
]

export const SORT_OPTIONS = [
  { value: 'createdAt', label: '등록일' },
  { value: 'title', label: '제목' },
  { value: 'purchaseDate', label: '구입일' },
]
