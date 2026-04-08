import client from './client'

export const fetchStats = () =>
  client.get('/stats')
