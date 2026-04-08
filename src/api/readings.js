import client from './client'

export const fetchReadings = (bookId) =>
  client.get(`/books/${bookId}/reading-logs`)

export const createReading = (bookId, data) =>
  client.post(`/books/${bookId}/reading-logs`, data)

export const updateReading = (bookId, id, data) =>
  client.put(`/books/${bookId}/reading-logs/${id}`, data)

export const deleteReading = (bookId, id) =>
  client.delete(`/books/${bookId}/reading-logs/${id}`)
