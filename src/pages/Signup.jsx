import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/auth'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setIsPending(true)
    try {
      await signup(form)
      navigate('/login')
    } catch (err) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('duplicate') || err.message?.includes('이미')) {
        setError('이미 사용 중인 이메일입니다.')
      } else {
        setError(err.message ?? '회원가입에 실패했습니다.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">회원가입</h1>

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
            {isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
