import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReadings, createReading, updateReading, deleteReading } from '../api/readings'

export const useReadings = (bookId) =>
  useQuery({
    queryKey: ['readings', bookId],
    queryFn: () => fetchReadings(bookId),
    enabled: !!bookId,
  })

export const useCreateReading = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createReading(bookId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['readings', bookId] }),
  })
}

export const useUpdateReading = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateReading(bookId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['readings', bookId] }),
  })
}

export const useDeleteReading = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteReading(bookId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['readings', bookId] }),
  })
}
