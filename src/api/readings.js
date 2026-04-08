import client from './client'

export const fetchReadings = (bookId) =>
  client.get(`/books/${bookId}/readings`)

export const createReading = (bookId, data) =>
  client.post(`/books/${bookId}/readings`, data)

export const updateReading = (bookId, id, data) =>
  client.put(`/books/${bookId}/readings/${id}`, data)

export const deleteReading = (bookId, id) =>
  client.delete(`/books/${bookId}/readings/${id}`)
