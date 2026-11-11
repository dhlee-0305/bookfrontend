import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDocuments, fetchDocument, createDocument, updateDocument, deleteDocument } from '../api/documents'

export function useDocuments(params) {
  return useQuery({ queryKey: ['documents', params], queryFn: () => fetchDocuments(params) })
}

export function useDocument(id) {
  return useQuery({ queryKey: ['document', id], queryFn: () => fetchDocument(id), enabled: !!id })
}

export function useSaveDocument(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => id ? updateDocument(id, data) : createDocument(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['documents'] }),
        queryClient.invalidateQueries({ queryKey: ['document', id] }),
      ])
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: ['document', String(id)] })
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
