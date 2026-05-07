import { useQuery } from '@tanstack/react-query'
import { fetchStats } from '../api/stats'
import { useAuth } from '../context/AuthContext'

export const useStats = () => {
  const { user } = useAuth()
  const email = user?.email

  return useQuery({
    queryKey: ['stats', email],
    queryFn: () => fetchStats(email),
    enabled: !!email,
  })
}
