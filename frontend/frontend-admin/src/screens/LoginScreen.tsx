import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginScreen() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F8F9FA', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="bg-white rounded-2xl p-10"
        style={{
          width: 480,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}
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
              Email or Mobile
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or mobile"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#00C4B4' } as React.CSSProperties}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 text-white font-medium rounded-xl transition-colors"
            style={{ backgroundColor: '#00C4B4' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}
          >
            Sign In
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
