import client from './client'

export const fetchBooks = (params) =>
  client.get('/books', { params: { ...params, include: 'readStatus' } })

export const fetchBook = (id) =>
  client.get(`/books/${id}`)

export const createBook = (data) =>
  client.post('/books', data)

export const updateBook = (id, data) =>
  client.put(`/books/${id}`, data)

export const deleteBook = (id) =>
  client.delete(`/books/${id}`)
