import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import CollectionsPage from '@/pages/CollectionsPage'
import CollectionDetailPage from '@/pages/CollectionDetailPage'
import DocumentsPage from '@/pages/DocumentsPage'
import AskPage from '@/pages/AskPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'
import ComparePage from '@/pages/ComparePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1424',
            color: '#EDF2FF',
            border: '1px solid #1E2D4A',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          },
          success: { iconTheme: { primary: '#10D9A0', secondary: '#080C14' } },
          error:   { iconTheme: { primary: '#FF4D6A', secondary: '#080C14' } },
        }}
      />
      <Routes>
        <Route path="/"                 element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login"            element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register"         element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password"  element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard"                       element={<DashboardPage />} />
          <Route path="/collections"                     element={<CollectionsPage />} />
          <Route path="/collections/:id"                 element={<CollectionDetailPage />} />
          <Route path="/collections/:id/documents"       element={<DocumentsPage />} />
          <Route path="/ask"                             element={<AskPage />} />
          <Route path="/history"                         element={<HistoryPage />} />
          <Route path="/compare"                         element={<ComparePage />} />
          <Route path="/settings"                        element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
