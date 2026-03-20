import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authService } from './services/authService'

// Komponenten
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Dashboard from './components/Dashboard/Dashboard'
import BettingPage from './components/Betting/BettingPage'
import LiveGames from './components/Live/LiveGames'
import AdminPanel from './components/Admin/AdminPanel'
import Standings from './components/Standings/Standings'

// Protected Route
function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { setUser, setProfile } = useAuthStore()

  useEffect(() => {
    // Session beim Load überprüfen
    const checkSession = async () => {
      const session = await authService.getSession()
      if (session) {
        const { data: profile } = await authService.getUserProfile(session.user.id)
        setUser(session.user)
        setProfile(profile)
      }
    }

    checkSession()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/bet" element={
          <ProtectedRoute><BettingPage /></ProtectedRoute>
        } />
        
        <Route path="/live" element={
          <ProtectedRoute><LiveGames /></ProtectedRoute>
        } />
        
        <Route path="/standings" element={
          <ProtectedRoute><Standings /></ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute><AdminPanel /></ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
