import apiClient from './client'
import type { PackageResponse, CreatePackageRequest, UpdatePackageRequest } from '../types'

export const packagesApi = {
  getAll: () =>
    apiClient.get<PackageResponse[]>('/Packages').then((r) => r.data),

  create: (data: CreatePackageRequest) =>
    apiClient.post<PackageResponse>('/Packages', data).then((r) => r.data),

  update: (id: string, data: UpdatePackageRequest) =>
    apiClient.put<PackageResponse>(`/Packages/${id}`, data).then((r) => r.data),

  retire: (id: string) =>
    apiClient.put<PackageResponse>(`/Packages/${id}/retire`).then((r) => r.data),

  reactivate: (id: string) =>
    apiClient.put<PackageResponse>(`/Packages/${id}/reactivate`).then((r) => r.data),
}
