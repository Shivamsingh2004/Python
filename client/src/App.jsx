import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import WriteBlog from './pages/WriteBlog'
import BlogDetail from './pages/BlogDetail'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

function App() {
  const { dark } = useTheme()

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/write" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
