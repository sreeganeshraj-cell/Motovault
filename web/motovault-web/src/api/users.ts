import apiClient from './client'
import type { UserResponse, CreateUserRequest } from '../types'

export const usersApi = {
  getAll: () =>
    apiClient.get<UserResponse[]>('/Users').then((r) => r.data),

  create: (data: CreateUserRequest) =>
    apiClient.post<UserResponse>('/Users', data).then((r) => r.data),
}
