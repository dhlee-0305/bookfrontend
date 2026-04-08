import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            📚 내 서재
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-gray-600">
            <Link
              to="/books"
              className={`hover:text-indigo-600 transition-colors ${
                pathname.startsWith('/books') ? 'text-indigo-600' : ''
              }`}
            >
              도서 목록
            </Link>
            <Link
              to="/stats"
              className={`hover:text-indigo-600 transition-colors ${
                pathname === '/stats' ? 'text-indigo-600' : ''
              }`}
            >
              통계
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
