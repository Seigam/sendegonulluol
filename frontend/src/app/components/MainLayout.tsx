import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { HeartHandshake, Home, User, Shield, Briefcase, Menu, X, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAppContext();

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı.');
    navigate('/');
  };

  // Rol bazlı nav filtreleme
  const allNavLinks = [
    { name: 'Ana Sayfa', path: '/home', icon: <Home size={20} />, roles: ['volunteer', 'organizer', 'admin'] },
    { name: 'Profilim', path: '/profile', icon: <User size={20} />, roles: ['volunteer', 'organizer', 'admin'] },
    { name: 'Organizatör Paneli', path: '/organizer', icon: <Briefcase size={20} />, roles: ['organizer', 'admin'] },
    { name: 'Admin Paneli', path: '/admin', icon: <Shield size={20} />, roles: ['admin'] },
  ];

  const navLinks = allNavLinks.filter(
    (l) => !currentUser || l.roles.includes(currentUser.role)
  );

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/home" className="flex items-center gap-2">
                <div className="bg-teal-600 text-white p-1.5 rounded-lg">
                  <HeartHandshake size={24} />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Sen de Gönüllü Ol</span>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="ml-4 flex items-center gap-1 text-gray-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              >
                <span className="sr-only">Menüyü aç</span>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-4 w-full"
              >
                <LogOut size={20} />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
