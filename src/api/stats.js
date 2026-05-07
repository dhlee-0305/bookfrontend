import client from './client'

export const fetchStats = (email) =>
  client.get('/stats', { params: { email } })
