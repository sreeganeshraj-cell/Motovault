import apiClient from './client'
import type { SubscriptionResponse, CreateSubscriptionRequest, BookSubscriptionRequest, PendingSubscriptionDto } from '../types'

export const subscriptionsApi = {
  getAll: () =>
    apiClient.get<SubscriptionResponse[]>('/Subscriptions').then((r) => r.data),

  getPending: () =>
    apiClient.get<PendingSubscriptionDto[]>('/Subscriptions/pending').then((r) => r.data),

  create: (data: CreateSubscriptionRequest) =>
    apiClient.post<SubscriptionResponse>('/Subscriptions', data).then((r) => r.data),

  cancel: (id: string, endDate: string) =>
    apiClient.put(`/Subscriptions/${id}/cancel`, { endDate }).then((r) => r.data),

  complete: (id: string, endDate: string) =>
    apiClient.put(`/Subscriptions/${id}/complete`, { endDate }).then((r) => r.data),

  approve: (id: string) =>
    apiClient.put(`/Subscriptions/${id}/approve`).then((r) => r.data),

  getActiveByVehicle: (vehicleId: string) =>
    apiClient.get<SubscriptionResponse>(`/Subscriptions/vehicle/${vehicleId}/active`).then((r) => r.data),

  book: (data: BookSubscriptionRequest) =>
    apiClient.post<SubscriptionResponse>('/Subscriptions/book', data).then((r) => r.data),
}
