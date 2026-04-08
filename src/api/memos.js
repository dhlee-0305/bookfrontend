import client from './client'

export const fetchMemos = (bookId) =>
  client.get(`/books/${bookId}/memos`)

export const createMemo = (bookId, data) =>
  client.post(`/books/${bookId}/memos`, data)

export const updateMemo = (bookId, id, data) =>
  client.put(`/books/${bookId}/memos/${id}`, data)

export const deleteMemo = (bookId, id) =>
  client.delete(`/books/${bookId}/memos/${id}`)
