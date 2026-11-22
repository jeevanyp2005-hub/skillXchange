import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Browse from './pages/Browse'
import Requests from './pages/Requests'
import UserProfile from './pages/UserProfile'

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    )
}

// Redirect already-logged-in users away from auth pages
// NOTE: must be rendered inside <AuthProvider> (which it is, via Routes)
function PublicOnly({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    if (user) return <Navigate to="/dashboard" replace />
    return children
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: '12px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        },
                        success: {
                            iconTheme: { primary: '#047857', secondary: '#ffffff' },
                        },
                        error: {
                            iconTheme: { primary: '#b91c1c', secondary: '#ffffff' },
                        },
                    }}
                />
                <Routes>
                    {/* Public routes — redirect to dashboard if already logged in */}
                    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
                    <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

                    {/* Protected routes (with nav) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout><Dashboard /></Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Layout><Profile /></Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/browse"
                        element={
                            <ProtectedRoute>
                                <Layout><Browse /></Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/requests"
                        element={
                            <ProtectedRoute>
                                <Layout><Requests /></Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/:id"
                        element={
                            <ProtectedRoute>
                                <Layout><UserProfile /></Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
