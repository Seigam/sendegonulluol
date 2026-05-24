import React, { useState, useEffect } from 'react';
import { HeartHandshake } from 'lucide-react';
import { api } from '../../services/api';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: any = await api.get('/users/stats');
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error('Kullanıcı istatistikleri alınamadı:', error);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* 
        LEFT SIDE (Form Container)
        - Full width on mobile, half width on desktop 
      */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white min-h-screen relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          {/* Header */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <div className="bg-teal-600 text-white p-2 rounded-xl">
                <HeartHandshake size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Sen de Gönüllü Ol
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500 text-sm md:text-base">
              {subtitle}
            </p>
          </div>

          {/* Form Content Injected Here */}
          {children}

        </div>
      </div>

      {/* 
        RIGHT SIDE (Image)
        - Hidden on mobile, half width on desktop 
      */}
      <div className="hidden md:flex md:w-1/2 relative bg-teal-900 sticky top-0 h-screen">
        <div className="absolute inset-0 z-10 bg-teal-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-teal-900/80 via-transparent to-transparent" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1758599668547-2b1192c10abb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjB2b2x1bnRlZXJpbmclMjBkaXZlcnNlJTIwcGVvcGxlJTIwaGVscGluZ3xlbnwxfHx8fDE3NzQ2Mjg5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Diverse community of volunteers helping out"
        />
        
        {/* Right side content overlay */}
        <div className="relative z-30 flex flex-col justify-end p-12 w-full text-white pb-20">
          <div className="max-w-xl">
            <HeartHandshake size={48} className="mb-6 opacity-80" />
            <h3 className="text-4xl font-bold mb-4 leading-tight">
              Küçük bir adım,<br />büyük bir fark.
            </h3>
            <p className="text-lg text-teal-50 font-medium">
              Binlerce gönüllümüz ile birlikte topluluğumuz için daha iyi bir gelecek inşa ediyoruz. Bize katılın ve iyiliğin gücünü keşfedin.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-teal-900 object-cover"
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="Volunteer"
                  />
                ))}
              </div>
              <p className="text-sm font-medium opacity-80">
                {totalUsers !== null ? (
                  `${totalUsers} kayıtlı kullanıcı`
                ) : (
                  'Yükleniyor...'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
