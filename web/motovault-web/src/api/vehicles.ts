import apiClient from './client'
import type { VehicleResponse, CreateVehicleRequest } from '../types'

export const vehiclesApi = {
  getAll: () =>
    apiClient.get<VehicleResponse[]>('/Vehicles').then((r) => r.data),

  getByOwner: (ownerId: string) =>
    apiClient.get<VehicleResponse[]>(`/Vehicles/owner/${ownerId}`).then((r) => r.data),

  create: (data: CreateVehicleRequest) =>
    apiClient.post<VehicleResponse>('/Vehicles', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/Vehicles/${id}`).then((r) => r.data),
}
