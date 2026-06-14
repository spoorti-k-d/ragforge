import apiClient from './client'
import type { Collection, CollectionCreate } from '@/types'

export const collectionsApi = {
  list: async (): Promise<Collection[]> => {
    const { data } = await apiClient.get<Collection[]>('/collections')
    return data
  },

  get: async (id: string): Promise<Collection> => {
    const { data } = await apiClient.get<Collection>(`/collections/${id}`)
    return data
  },

  create: async (payload: CollectionCreate): Promise<Collection> => {
    const { data } = await apiClient.post<Collection>('/collections', payload)
    return data
  },

  update: async (id: string, payload: Partial<CollectionCreate>): Promise<Collection> => {
    const { data } = await apiClient.patch<Collection>(`/collections/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/${id}`)
  },
}
