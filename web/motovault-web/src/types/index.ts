// ─── Enums ───────────────────────────────────────────────────────────────────
export type Role = 'Owner' | 'Admin' | 'Staff'
export type VehicleType = 'Car' | 'Bike'
export type SlotStatus = 'Available' | 'Occupied'
export type SubscriptionStatus = 'Active' | 'Completed' | 'Cancelled' | 'Requested'
export type ServiceType = 'Cleaning' | 'Idling' | 'Ride' | 'Service'
export type MediaType = 'Image' | 'Video'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  password: string
}

export interface AuthResponse {
  token: string
  userId: string
  name: string
  role: Role
  expiresAt: string
}

// ─── Users ────────────────────────────────────────────────────────────────────
export interface UserResponse {
  id: string
  name: string
  phone?: string
  email?: string
  role: Role
  createdAt: string
}

export interface CreateUserRequest {
  name: string
  phone?: string
  email?: string
  role: Role
  password: string
}

export interface UpdateUserRequest {
  name: string
  phone?: string
  email?: string
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export interface VehicleResponse {
  id: string
  ownerId: string
  ownerName: string
  type: VehicleType
  brand?: string
  model?: string
  registrationNumber?: string
  createdAt: string
}

export interface CreateVehicleRequest {
  ownerId: string
  type: VehicleType
  brand?: string
  model?: string
  registrationNumber?: string
}

export interface UpdateVehicleRequest {
  brand?: string
  model?: string
  registrationNumber?: string
}

// ─── Storage Slots ────────────────────────────────────────────────────────────
export interface StorageSlotResponse {
  id: string
  slotNumber: number
  type: VehicleType
  status: SlotStatus
  createdAt: string
}

export interface CreateStorageSlotRequest {
  slotNumber: number
  type: VehicleType
}

export interface UpdateStorageSlotStatusRequest {
  status: SlotStatus
}

// ─── Packages ─────────────────────────────────────────────────────────────────
export interface PackageResponse {
  id: string
  name: string
  description?: string
  price?: number
  isActive: boolean
  createdAt: string
}

export interface CreatePackageRequest {
  name: string
  description?: string
  price?: number
}

export interface UpdatePackageRequest {
  name: string
  description?: string
  price?: number
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export interface SubscriptionResponse {
  id: string
  vehicleId: string
  vehicleRegistrationNumber: string
  vehicleType: VehicleType
  ownerName: string
  packageId: string
  packageName: string
  slotId: string
  slotNumber: number
  startDate: string
  endDate?: string
  status: SubscriptionStatus
  createdAt: string
}

export interface CreateSubscriptionRequest {
  vehicleId: string
  packageId: string
  slotId: string
  startDate: string
  endDate?: string
}

export interface UpdateSubscriptionRequest {
  endDate: string
}

export interface BookSubscriptionRequest {
  vehicleType: VehicleType
  brand?: string
  model?: string
  registrationNumber?: string
  packageId: string
  startDate: string
  endDate: string
}

// ─── Service Logs ─────────────────────────────────────────────────────────────
export interface ServiceLogResponse {
  id: string
  vehicleId: string
  vehicleRegistrationNumber: string
  subscriptionId: string
  serviceDate: string
  serviceType: ServiceType
  notes?: string
  createdBy?: string
  createdByName?: string
  createdAt: string
  mediaCount: number
}

export interface CreateServiceLogRequest {
  vehicleId: string
  subscriptionId: string
  serviceDate: string
  serviceType: ServiceType
  notes?: string
  createdBy?: string
}

export interface UpdateServiceLogRequest {
  notes?: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface ActiveVehicle {
  vehicleType: string
  brand?: string
  model?: string
  registrationNumber?: string
  slotNumber: number
  slotType: string
  startDate: string
}

export interface RecentActivity {
  serviceType: string
  brand?: string
  model?: string
  registrationNumber?: string
  createdByName?: string
  createdAt: string
  notes?: string
}

export interface DashboardSummary {
  bikesInStorage: number
  carsInStorage: number
  bikeSlotsTotal: number
  bikeSlotsOccupied: number
  carSlotsTotal: number
  carSlotsOccupied: number
  activeSubscriptionsCount: number
  overdueCount: number
  pendingRequestsCount: number
  activeVehicles: ActiveVehicle[]
  recentActivity: RecentActivity[]
}

export interface PendingSubscriptionDto {
  id: string
  ownerName: string
  vehicleType: string
  brand?: string
  model?: string
  registrationNumber?: string
  packageName: string
  startDate: string
  createdAt: string
}

// ─── Service Media ────────────────────────────────────────────────────────────
export interface ServiceMediaResponse {
  id: string
  serviceLogId: string
  fileUrl: string
  mediaType?: MediaType
  createdAt: string
}

export interface CreateServiceMediaRequest {
  serviceLogId: string
  fileUrl: string
  mediaType?: MediaType
}
