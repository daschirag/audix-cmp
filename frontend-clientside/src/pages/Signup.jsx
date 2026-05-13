import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, validateForm } from '../utils/validation';
import '../styles/signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = validateForm(signupSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    if (!agree) {
      setErrors({ agree: 'You must agree to the terms and conditions' });
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      alert("Account created successfully! 🎉");
      navigate('/dashboard');
    }, 1800);
  };

  const handleGoogleSignup = () => {
    alert("Google Sign Up - Backend integration pending");
  };

  return (
    <div className="signup-root">
      <div className="signup-container">
        <div className="glass-signup">
          <div className="logo">
            <span className="text-3xl">🔐</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-1">Create Account</h2>
          <p className="text-slate-500 text-center mb-8">Join Audix CMP - DPDPA Compliant</p>

          <button onClick={handleGoogleSignup} className="google-btn mb-6">
            <img 
              src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number (Optional)"
                className={`input-field ${errors.mobile ? 'border-red-500' : ''}`}
                value={formData.mobile}
                onChange={handleChange}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
              />
              <p className="text-sm text-slate-600">
                I agree to the <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span> and 
                <span className="text-blue-600 cursor-pointer hover:underline"> Privacy Policy</span>
              </p>
            </div>
            {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}