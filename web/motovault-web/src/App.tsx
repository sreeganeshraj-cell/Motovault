import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleGuard from './routes/RoleGuard'
import AdminLayout from './layouts/AdminLayout'
import OwnerLayout from './layouts/OwnerLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/admin/DashboardPage'
import PackagesPage from './pages/admin/PackagesPage'
import SlotsPage from './pages/admin/SlotsPage'
import UsersPage from './pages/admin/UsersPage'
import VehiclesPage from './pages/admin/VehiclesPage'
import SubscriptionsPage from './pages/admin/SubscriptionsPage'
import ServiceLogsPage from './pages/admin/ServiceLogsPage'
import MyVehiclesPage from './pages/owner/MyVehiclesPage'
import MySubscriptionPage from './pages/owner/MySubscriptionPage'
import ServiceHistoryPage from './pages/owner/ServiceHistoryPage'
import OwnerLandingPage from './pages/owner/OwnerLandingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<div className="p-8 text-red-500">You are not authorised to view this page.</div>} />

          {/* Admin + Staff routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard roles={['Admin', 'Staff']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/service-logs" element={<ServiceLogsPage />} />
              </Route>
            </Route>
            <Route element={<RoleGuard roles={['Admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/packages" element={<PackagesPage />} />
                <Route path="/admin/slots" element={<SlotsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/vehicles" element={<VehiclesPage />} />
                <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Owner routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard roles={['Owner']} />}>
              {/* Standalone landing page — no nav rail */}
              <Route path="/owner/home" element={<OwnerLandingPage />} />
              <Route element={<OwnerLayout />}>
                <Route path="/owner/vehicles" element={<MyVehiclesPage />} />
                <Route path="/owner/subscription" element={<MySubscriptionPage />} />
                <Route path="/owner/service-history" element={<ServiceHistoryPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
