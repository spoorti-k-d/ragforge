import apiClient from './client'
import type { TokenResponse, User } from '@/types'

export const authApi = {
  register: async (email: string, full_name: string, password: string) => {
    const { data } = await apiClient.post<User>('/auth/register', { email, full_name, password })
    return data
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/login/json', { email, password })
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email })
    return data
  },

  verifyOtp: async (email: string, otp: string, new_password: string) => {
    const { data } = await apiClient.post('/auth/verify-otp', { email, otp, new_password })
    return data
  },
}
