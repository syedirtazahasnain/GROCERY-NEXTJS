'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
      if (data.status_code === 401) {
          setError(data.message || 'The email or password you entered is incorrect.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('userRole', data.data.role);
      if (data.data.role === 'admin' || data.data.role === 'superadmin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user/product-list');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="md:w-1/2 bg-[#2b3990] text-white flex flex-col items-center justify-center px-10 py-12">
        <img src="/images/logo/logo-light.webp" alt="Sync Graphic" className="w-2/3 max-w-sm pb-10" />
        <h1 className="text-3xl font-bold mb-4 tracking-wide uppercase text-white text-center">Your Gateway to</h1>
        <h2 className="text-5xl font-extrabold mb-4 text-[#00aeef]">My Grocery App</h2>
        <p className="text-xl mb-8 text-center">All you need is a little <span className="font-bold">Sync</span></p>
      </div>
      {/* Right Panel (Form) */}
      <div className="md:w-1/2 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#2b3990]">Log in to your account</h2>
            <p className="text-sm text-gray-500">Welcome back to My Grocery App</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                required
              />
            </div>

          <div className="mb-6 relative">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Password
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aeef] pr-10"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      </div>
    </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#2b3990] text-white py-2 rounded-lg hover:bg-[#00aeef] transition-colors font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <p className="mt-4 text-center text-sm">
              Don’t have an account?{' '}
              <button
                disabled
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-[#00aeef] hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
