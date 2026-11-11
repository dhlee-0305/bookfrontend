import client from './client'

export const fetchDocuments = (params) => client.get('/mkbrd', { params })
export const fetchDocument = (id) => client.get(`/mkbrd/${id}`)

export function documentFormData({ category, file }) {
  const data = new FormData()
  if (category !== undefined) data.append('category', category)
  if (file) data.append('file', file)
  return data
}

// 공통 JSON 헤더를 해제하고 브라우저가 multipart boundary를 생성하도록 한다.
const uploadConfig = { headers: { 'Content-Type': undefined } }
export const createDocument = (data) => client.post('/mkbrd', documentFormData(data), uploadConfig)
export const updateDocument = (id, data) => client.put(`/mkbrd/${id}`, documentFormData(data), uploadConfig)

export const deleteDocument = (id) => client.delete(`/mkbrd/${id}`)
