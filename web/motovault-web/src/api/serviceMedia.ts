import apiClient from './client'
import type { ServiceMediaResponse, CreateServiceMediaRequest, MediaType } from '../types'

interface UploadResult {
  fileUrl: string
  mediaType: MediaType
}

export const serviceMediaApi = {
  upload: (file: File): Promise<UploadResult> => {
    const fd = new FormData()
    fd.append('file', file)
    // Axios v1.x JSON-stringifies FormData when the instance has Content-Type: application/json
    // as a default. Override transformRequest to pass FormData through and clear the header so
    // the browser sets multipart/form-data with the correct boundary automatically.
    return apiClient
      .post<UploadResult>('/ServiceMedia/upload', fd, {
        transformRequest: [(data: unknown, headers: Record<string, unknown>) => {
          delete headers['Content-Type']
          return data
        }],
      })
      .then((r) => r.data)
  },

  getByServiceLog: (serviceLogId: string) =>
    apiClient.get<ServiceMediaResponse[]>(`/ServiceMedia/service-log/${serviceLogId}`).then((r) => r.data),

  create: (data: CreateServiceMediaRequest) =>
    apiClient.post<ServiceMediaResponse>('/ServiceMedia', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/ServiceMedia/${id}`).then((r) => r.data),
}
