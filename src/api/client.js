import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message ?? '오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  },
)

export default client
