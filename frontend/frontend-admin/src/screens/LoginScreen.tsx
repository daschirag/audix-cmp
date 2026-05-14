import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginScreen() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Login failed')
        setLoading(false)
        return
      }

      sessionStorage.setItem('accessToken', data.data.accessToken)
      sessionStorage.setItem('user', JSON.stringify(data.data.user))
      setLoading(false)
      navigate('/dashboard')

    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on port 3001.')
      setLoading(false)
    }
  }

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F8F9FA', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="bg-white rounded-2xl p-10"
        style={{ width: 480, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#00C4B4' }}
          >
            <span className="text-white text-3xl font-semibold">A</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
            Audix CMP
          </h1>
          <p className="text-sm text-gray-600 mt-1">DPO / Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm hover:underline transition-all"
              style={{ color: '#00C4B4' }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-medium rounded-xl transition-colors"
            style={{ backgroundColor: loading ? '#9CA3AF' : '#00C4B4' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#00B3A3'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#00C4B4'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Need admin access?{' '}
          <span className="hover:underline cursor-pointer" style={{ color: '#00C4B4' }}>
            Contact support
          </span>
        </p>
      </div>
    </div>
  )
}