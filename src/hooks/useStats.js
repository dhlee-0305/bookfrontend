import { useQuery } from '@tanstack/react-query'
import { fetchStats } from '../api/stats'

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })
