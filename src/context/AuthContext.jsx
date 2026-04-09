import { createContext, useContext, useEffect, useState } from 'react'
import { fetchMe, logout as logoutApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = 초기화 전, null = 비로그인

  useEffect(() => {
    fetchMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
  }, [])

  const login = (userData) => setUser(userData)

  const logout = async () => {
    await logoutApi()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
