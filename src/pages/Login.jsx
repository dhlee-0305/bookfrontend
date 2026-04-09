import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const from = location.state?.from ?? '/books'
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      const res = await loginApi(form)
      login(res.data)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('인증') || err.message?.includes('비밀번호') || err.message?.includes('없')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        setError(err.message ?? '로그인에 실패했습니다.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
            <input
              type="text"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="example@email.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
