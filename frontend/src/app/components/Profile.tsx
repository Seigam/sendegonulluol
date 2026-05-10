import React, { useEffect, useState } from 'react';
import { Award, Star, Calendar, ArrowRight, Zap, Target, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router';
import { getMe } from '../../services/authService';
import { toast } from 'sonner';

const BADGE_DEFINITIONS = [
  { name: 'İlk Adım', description: 'İlk etkinliğine katıldın', icon: <Star className="w-8 h-8 text-yellow-500" />, minEvents: 1 },
  { name: 'Aktif Gönüllü', description: '3 etkinliği tamamladın', icon: <Award className="w-8 h-8 text-green-500" />, minEvents: 3 },
  { name: 'Deneyimli Gönüllü', description: '5 etkinliği tamamladın', icon: <Zap className="w-8 h-8 text-purple-500" />, minEvents: 5 },
  { name: 'Uzman Gönüllü', description: '10 etkinliği tamamladın', icon: <Award className="w-8 h-8 text-blue-500" />, minEvents: 10 },
];

export function Profile() {
  const { currentUser, setCurrentUser, myApplications, fetchMyApplications } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const user = await getMe();
      setCurrentUser(user);
      await fetchMyApplications();
    } catch (err: any) {
      toast.error('Profil yenilenemedi.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Profil yüklenemedi. Lütfen giriş yapın.</p>
      </div>
    );
  }

  const completedCount = currentUser.completedEventsCount || 0;

  // Seviye hesapla
  const levelThresholds = [0, 5, 10, 25, 50];
  const currentLevel = levelThresholds.findIndex((t, i) => {
    const next = levelThresholds[i + 1];
    return completedCount >= t && (next === undefined || completedCount < next);
  }) + 1;
  const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const progressToNext = Math.min(100, Math.round((completedCount / nextThreshold) * 100));

  // Rozet durumu
  const badges = BADGE_DEFINITIONS.map((b) => ({
    ...b,
    earned: currentUser.badges?.some((ub) => ub.name === b.name) || completedCount >= b.minEvents,
  }));

  // Toplam puan (her tamamlanan etkinlik = 250 puan)
  const totalPoints = completedCount * 250;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Profil Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-700 h-32 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        </div>

        <div className="px-6 md:px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 pt-6 mb-8 flex-wrap">
            {/* Avatar Kutusu */}
            <div className="w-32 h-32 shrink-0 rounded-full border-4 border-white bg-teal-100 shadow-md flex items-center justify-center relative overflow-hidden mx-auto md:mx-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-teal-600">{currentUser.name.charAt(0)}</span>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-teal-600/80 text-white text-xs font-bold text-center py-1">
                Lvl {currentLevel}
              </div>
            </div>

            {/* Profil Bilgileri */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 truncate">{currentUser.name} {currentUser.surname}</h1>
              <p className="text-gray-500 truncate">{currentUser.email}</p>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="inline-block text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                  {currentUser.currentRank}
                </span>
                {currentUser.city && (
                  <span className="text-xs text-gray-400">📍 {currentUser.city}</span>
                )}
              </div>
            </div>

            {/* Puan ve Buton */}
            <div className="flex flex-col gap-2 items-center md:items-end shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Toplam Puan</p>
                  <p className="text-2xl font-bold text-orange-600">{totalPoints}</p>
                </div>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1">
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>
          </div>

          {/* Seviye İlerlemesi */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-bold text-gray-900">Seviye İlerlemesi</h3>
                <p className="text-sm text-gray-500">Sonraki seviyeye {Math.max(0, nextThreshold - completedCount)} etkinlik kaldı</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-teal-600">{completedCount}</span>
                <span className="text-gray-400 font-medium"> / {nextThreshold} Etkinlik</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Rozetler */}
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Rozetlerim</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {badges.map((badge, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${badge.earned ? 'bg-gray-50 border border-gray-100' : 'opacity-40 grayscale'}`}>
                <div className={`p-3 rounded-full ${badge.earned ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{badge.name}</h4>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Katılım Geçmişi */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Katılım Geçmişim</h2>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz bir etkinliğe katılmadın</h3>
              <p className="text-gray-500 mb-6">İlk adımını atmak için hemen etkinlikleri keşfet.</p>
              <Link to="/home" className="inline-flex bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Etkinlikleri Keşfet
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {myApplications.map((app) => (
                  <li key={app._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {app.event?.coverImage && (
                        <img src={app.event.coverImage} alt={app.event.title} className="w-16 h-16 rounded-xl object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{app.event?.title}</h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status === 'accepted' ? 'Kabul Edildi' : app.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{app.event?.category}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {app.event?.date?.start && new Date(app.event.date.start).toLocaleDateString('tr-TR')}
                          </span>
                          <span>Başvuru: {new Date(app.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      {app.event?._id && (
                        <Link to={`/event/${app.event._id}`} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                          <ArrowRight size={20} />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
