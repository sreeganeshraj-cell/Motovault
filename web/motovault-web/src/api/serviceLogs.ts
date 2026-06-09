import apiClient from './client'
import type { ServiceLogResponse, CreateServiceLogRequest } from '../types'

export const serviceLogsApi = {
  getAll: () =>
    apiClient.get<ServiceLogResponse[]>('/ServiceLogs').then((r) => r.data),

  getByVehicle: (vehicleId: string) =>
    apiClient.get<ServiceLogResponse[]>(`/ServiceLogs/vehicle/${vehicleId}`).then((r) => r.data),

  create: (data: CreateServiceLogRequest) =>
    apiClient.post<ServiceLogResponse>('/ServiceLogs', data).then((r) => r.data),
}
