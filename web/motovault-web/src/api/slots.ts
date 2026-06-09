import apiClient from './client'
import type { StorageSlotResponse, CreateStorageSlotRequest, UpdateStorageSlotStatusRequest } from '../types'

export const slotsApi = {
  getAll: () =>
    apiClient.get<StorageSlotResponse[]>('/StorageSlots').then((r) => r.data),

  create: (data: CreateStorageSlotRequest) =>
    apiClient.post<StorageSlotResponse>('/StorageSlots', data).then((r) => r.data),

  updateStatus: (id: string, data: UpdateStorageSlotStatusRequest) =>
    apiClient.put<StorageSlotResponse>(`/StorageSlots/${id}/status`, data).then((r) => r.data),
}
