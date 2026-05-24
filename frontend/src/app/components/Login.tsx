import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { AuthLayout } from './AuthLayout';
import { login } from '../../services/authService';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      setCurrentUser(user);
      toast.success(`Hoş geldiniz, ${user.name}!`);
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Hoş Geldiniz 👋"
      subtitle="Hesabınıza giriş yaparak iyilik hareketine katılın."
    >
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-posta Adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 text-gray-900 transition-colors"
                placeholder="ornek@posta.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 text-gray-900 transition-colors"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-teal-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            ) : null}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            {!loading && <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Hesabınız yok mu?{' '}
        <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
          Hemen Kayıt Olun
        </Link>
      </div>
    </AuthLayout>
  );
}
