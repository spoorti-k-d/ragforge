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

  updateProfile: async (full_name: string): Promise<User> => {
    const { data } = await apiClient.put<User>('/auth/me', { full_name })
    return data
  },

  changePassword: async (current_password: string, new_password: string): Promise<{ ok: boolean; message: string }> => {
    const { data } = await apiClient.put('/auth/me/password', { current_password, new_password })
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
