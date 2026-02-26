import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', { email, password })
      login(data.user, data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseToken = await result.user.getIdToken()
      const { data } = await API.post('/auth/firebase', { firebaseToken })
      login(data.user, data.token)
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Google login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-1 border-t dark:border-gray-600"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t dark:border-gray-600"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border dark:border-gray-600 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <FcGoogle className="text-xl" /> Continue with Google
        </button>
        <p className="text-center text-sm mt-6 text-gray-500">
          Don&apos;t have an account? <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
