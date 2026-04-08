import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBooks, fetchBook, createBook, updateBook, deleteBook } from '../api/books'

export const useBooks = (params) =>
  useQuery({
    queryKey: ['books', params],
    queryFn: () => fetchBooks(params),
  })

export const useBook = (id) =>
  useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBook(id),
    enabled: !!id,
  })

export const useCreateBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}

export const useUpdateBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateBook(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['book', id] })
    },
  })
}

export const useDeleteBook = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}
