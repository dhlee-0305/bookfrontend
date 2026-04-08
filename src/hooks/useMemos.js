import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMemos, createMemo, updateMemo, deleteMemo } from '../api/memos'

export const useMemos = (bookId) =>
  useQuery({
    queryKey: ['memos', bookId],
    queryFn: () => fetchMemos(bookId),
    enabled: !!bookId,
  })

export const useCreateMemo = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createMemo(bookId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memos', bookId] }),
  })
}

export const useUpdateMemo = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateMemo(bookId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memos', bookId] }),
  })
}

export const useDeleteMemo = (bookId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteMemo(bookId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memos', bookId] }),
  })
}
