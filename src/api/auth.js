import client from './client'

export const fetchMe = () => client.get('/auth/me')

export const signup = (data) => client.post('/auth/signup', data)

export const login = (data) => client.post('/auth/login', data)

export const logout = () => client.post('/auth/logout')
