import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { AuthLayout } from './AuthLayout';
import { register } from '../../services/authService';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'volunteer' | 'organizer'>('volunteer');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    organizationName: '',
  });
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // "Ad Soyad" alanını backend'in beklediği name + surname'e böl
    const parts = form.fullName.trim().split(' ');
    const name = parts[0] || '';
    const surname = parts.slice(1).join(' ') || name; // soyad yoksa adı tekrar kullan

    try {
      const user = await register({
        name,
        surname,
        email: form.email,
        password: form.password,
        role,
        city: form.city || undefined,
        organizationName: role === 'organizer' ? form.organizationName : undefined,
      });
      setCurrentUser(user);
      toast.success('Hesabınız oluşturuldu! Hoş geldiniz 🎉');
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message || 'Kayıt oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Aramıza Katılın 🌟"
      subtitle="Gönüllü ağımıza katılmak için hesabınızı oluşturun."
    >
      <form className="mt-8 space-y-4" onSubmit={handleRegister}>

        {/* Rol Seçimi */}
        <div className="grid grid-cols-2 gap-3">
          {(['volunteer', 'organizer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                role === r
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {r === 'volunteer' ? '🙋 Gönüllü' : '🏢 Organizatör'}
            </button>
          ))}
        </div>

        {/* Ad Soyad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
            Ad Soyad
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={form.fullName}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
              placeholder="Adınız Soyadınız"
            />
          </div>
        </div>

        {/* E-posta */}
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
              required
              value={form.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
              placeholder="ornek@posta.com"
            />
          </div>
        </div>

        {/* Şehir */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
            Şehir
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={form.city}
            onChange={handleChange}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
            placeholder="İstanbul"
          />
        </div>

        {/* Organizatör adı (sadece org için) */}
        {role === 'organizer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="organizationName">
              Topluluk / Kurum Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required={role === 'organizer'}
                value={form.organizationName}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
                placeholder="Yeşil Doğa Derneği"
              />
            </div>
          </div>
        )}

        {/* Şifre */}
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
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50"
              placeholder="En az 6 karakter"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            )}
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            {!loading && <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Zaten hesabınız var mı?{' '}
        <Link to="/" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
          Giriş Yapın
        </Link>
      </div>
    </AuthLayout>
  );
}
