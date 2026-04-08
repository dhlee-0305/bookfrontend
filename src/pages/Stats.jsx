import { useStats } from '../hooks/useStats'
import { BOOK_STATUS } from '../constants/book'

/* ── 공통 색상 팔레트 ── */
const STATUS_COLORS = {
  OWNED: 'bg-blue-400',
  READING: 'bg-green-400',
  DONE: 'bg-purple-400',
  EXCLUDED: 'bg-gray-300',
  SOLD: 'bg-orange-400',
  DONATED: 'bg-pink-400',
}

const GENRE_COLORS = [
  'bg-indigo-400', 'bg-sky-400', 'bg-teal-400', 'bg-emerald-400',
  'bg-yellow-400', 'bg-orange-400', 'bg-rose-400', 'bg-fuchsia-400',
  'bg-violet-400', 'bg-cyan-400',
]

/* ── 요약 카드 ── */
function StatCard({ label, value, sub, color = 'text-indigo-600' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '-'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

/* ── 가로 바 차트 (상태별 / 장르별 공용) ── */
function BarChart({ items, total }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
  }
  return (
    <div className="space-y-2.5">
      {items.map(({ label, value, colorClass }) => {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0
        return (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{label}</span>
              <span className="font-medium">{value}권 ({pct}%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── 월별 독서량 차트 (세로 막대) ── */
function MonthlyChart({ byMonth }) {
  if (!byMonth || Object.keys(byMonth).length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
  }

  // 최근 12개월 키 생성
  const now = new Date()
  const keys = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const max = Math.max(...keys.map((k) => byMonth[k] ?? 0), 1)

  return (
    <div className="flex items-end gap-1 h-32 px-1">
      {keys.map((key) => {
        const count = byMonth[key] ?? 0
        const heightPct = (count / max) * 100
        const [, month] = key.split('-')
        return (
          <div key={key} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {count}
            </span>
            <div className="w-full flex flex-col justify-end" style={{ height: '88px' }}>
              <div
                className="w-full bg-indigo-400 rounded-t transition-all duration-500 hover:bg-indigo-500"
                style={{ height: `${heightPct}%`, minHeight: count > 0 ? '4px' : '0' }}
              />
            </div>
            <span className="text-xs text-gray-400">{Number(month)}월</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── 별점 분포 ── */
function RatingChart({ ratingDistribution, total }) {
  if (!ratingDistribution || total === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
  }
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = ratingDistribution[star] ?? 0
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-yellow-500 w-14 flex-shrink-0">{'★'.repeat(star)}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{count}개 ({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── 메인 페이지 ── */
export default function Stats() {
  const { data, isLoading, isError, error } = useStats()
  const stats = data?.data ?? data ?? {}

  const totalBooks = stats.totalBooks ?? 0
  const byStatus = stats.byStatus ?? {}
  const byGenre = stats.byGenre ?? {}
  const byMonth = stats.byMonth ?? {}
  const avgRating = stats.avgRating ?? null
  const ratingDistribution = stats.ratingDistribution ?? {}
  const totalReadings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0)

  const statusItems = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      label: BOOK_STATUS[key]?.label ?? key,
      value,
      colorClass: STATUS_COLORS[key] ?? 'bg-gray-300',
    }))
    .sort((a, b) => b.value - a.value)

  const genreItems = Object.entries(byGenre)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value,
      colorClass: GENRE_COLORS[i % GENRE_COLORS.length],
    }))

  const totalGenre = genreItems.reduce((s, { value }) => s + value, 0)

  const doneCount = byStatus['DONE'] ?? 0
  const readingCount = byStatus['READING'] ?? 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-400 text-sm">{error?.message}</div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">통계</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="전체 도서" value={`${totalBooks}권`} color="text-indigo-600" />
        <StatCard label="완독" value={`${doneCount}권`} color="text-purple-600"
          sub={totalBooks > 0 ? `완독률 ${Math.round((doneCount / totalBooks) * 100)}%` : undefined}
        />
        <StatCard label="읽는 중" value={`${readingCount}권`} color="text-green-600" />
        <StatCard
          label="평균 별점"
          value={avgRating != null ? `${Number(avgRating).toFixed(1)}★` : '-'}
          color="text-yellow-500"
          sub={totalReadings > 0 ? `${totalReadings}개 기록 기준` : undefined}
        />
      </div>

      {/* 월별 독서량 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">월별 완독 수 (최근 12개월)</h2>
        <MonthlyChart byMonth={byMonth} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* 상태별 분포 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">상태별 분포</h2>
          <BarChart items={statusItems} total={totalBooks} />
        </div>

        {/* 장르별 분포 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">장르별 분포</h2>
          <BarChart items={genreItems} total={totalGenre} />
        </div>
      </div>

      {/* 별점 분포 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">별점 분포</h2>
        <RatingChart ratingDistribution={ratingDistribution} total={totalReadings} />
      </div>
    </div>
  )
}
