import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Plus, List, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getEventApplications, getCSVExportUrl } from '../../services/applicationService';
import { toast } from 'sonner';
import type { Application } from '../../services/applicationService';

const CATEGORIES = ['Çevre', 'Doğa', 'Eğitim', 'Hayvan Hakları', 'Sağlık', 'Sosyal Yardım', 'Kültür & Sanat', 'Spor'];

export function OrganizerPanel() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
  const [loadingApps, setLoadingApps] = useState<string | null>(null);
  const [eventApps, setEventApps] = useState<Record<string, Application[]>>({});
  const { createEvent, managedEvents, fetchManagedEvents, deleteEvent, currentUser } = useAppContext();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '', description: '', category: '',
      city: '', address: '', dateStart: '', dateEnd: '',
      quota: 10,
    },
  });

  useEffect(() => {
    fetchManagedEvents();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        location: { city: data.city, address: data.address },
        date: { start: data.dateStart, end: data.dateEnd || data.dateStart },
        quota: Number(data.quota),
      });
      toast.success('Etkinlik oluşturuldu! Yönetici onayından sonra yayınlanacak.');
      reset();
      setActiveTab('manage');
    } catch (err: any) {
      toast.error(err.message || 'Etkinlik oluşturulamadı.');
    }
  };

  const handleLoadApps = async (eventId: string) => {
    setLoadingApps(eventId);
    try {
      const apps = await getEventApplications(eventId);
      setEventApps((prev) => ({ ...prev, [eventId]: apps }));
    } catch (err: any) {
      toast.error(err.message || 'Başvurular yüklenemedi.');
    } finally {
      setLoadingApps(null);
    }
  };

  const handleExportCSV = (eventId: string) => {
    const url = getCSVExportUrl(eventId);
    const token = localStorage.getItem('token');
    // Token ile download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('CSV indirilemedi.');
        return r.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Basvurular.csv`;
        link.click();
        toast.success('CSV başarıyla indirildi.');
      })
      .catch((err) => toast.error(err.message));
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" etkinliğini silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteEvent(id);
      toast.success('Etkinlik silindi.');
    } catch (err: any) {
      toast.error(err.message || 'Silinemedi.');
    }
  };

  if (currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizatör Paneli</h1>
          <p className="text-gray-500">Topluluğunuzun etkinliklerini oluşturun ve gönüllü başvurularını yönetin.</p>
        </div>
        <button onClick={() => fetchManagedEvents()} className="flex items-center gap-2 text-sm text-teal-600 border border-teal-200 rounded-lg px-3 py-2 hover:text-teal-700 transition-colors">
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="flex border-b border-gray-100">
          {(['manage', 'create'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 flex justify-center items-center gap-2 font-medium transition-colors ${activeTab === tab ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'manage' ? <><List size={20} /> Etkinlikleri Yönet</> : <><Plus size={20} /> Yeni Etkinlik</>}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'create' ? (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Başlık */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Etkinlik Başlığı</label>
                  <input
                    {...register('title', { required: 'Başlık zorunludur', minLength: { value: 5, message: 'En az 5 karakter' } })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Hafta Sonu Sahil Temizliği"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                </div>

                {/* Açıklama */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    {...register('description', { required: 'Açıklama zorunludur', minLength: { value: 20, message: 'En az 20 karakter' } })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    placeholder="Etkinliğin amacını ve yapılacakları anlatın..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
                </div>

                {/* Kategori + Kontenjan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      {...register('category', { required: 'Kategori seçiniz' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                    >
                      <option value="">Seçiniz...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Gönüllü Kontenjanı</label>
                    <input
                      type="number"
                      {...register('quota', { required: 'Zorunlu', min: { value: 1, message: 'En az 1 kişi' } })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.quota && <p className="text-red-500 text-xs mt-1">{errors.quota.message as string}</p>}
                  </div>
                </div>

                {/* Şehir + Adres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Şehir</label>
                    <input
                      {...register('city', { required: 'Şehir zorunludur' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="İstanbul"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Adres / Buluşma Noktası</label>
                    <input
                      {...register('address', { required: 'Adres zorunludur' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Kadıköy Meydan"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
                  </div>
                </div>

                {/* Tarih */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                    <input type="date" {...register('dateStart', { required: 'Tarih zorunludur' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    {errors.dateStart && <p className="text-red-500 text-xs mt-1">{errors.dateStart.message as string}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                    <input type="date" {...register('dateEnd')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors">
                    <CheckCircle size={20} />
                    Etkinliği Onaya Gönder
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {managedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">Henüz bir etkinlik oluşturmadınız.</p>
                  <button onClick={() => setActiveTab('create')} className="text-teal-600 font-medium hover:underline">
                    Hemen yeni bir etkinlik oluşturun
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {managedEvents.map((event) => {
                    const apps = eventApps[event._id];
                    return (
                      <div key={event._id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                event.status === 'approved' ? 'bg-green-100 text-green-700' :
                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {event.status === 'approved' ? 'Yayında' : event.status === 'pending' ? 'Onay Bekliyor' : 'Reddedildi'}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-1 mb-2">{event.description}</p>
                            <div className="flex gap-6 text-sm text-gray-600">
                              <span><strong>Tarih:</strong> {new Date(event.date.start).toLocaleDateString('tr-TR')}</span>
                              <span><strong>Şehir:</strong> {event.location.city}</span>
                              <span><strong>Başvuru:</strong> {event.appliedCount} / {event.quota}</span>
                            </div>
                            {event.adminMessage && (
                              <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                                <strong>Admin Notu:</strong> {event.adminMessage}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <button
                              onClick={() => handleLoadApps(event._id)}
                              disabled={loadingApps === event._id}
                              className="border border-gray-200 bg-white text-gray-700 hover:text-teal-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                            >
                              {loadingApps === event._id ? <RefreshCw size={16} className="animate-spin" /> : null}
                              Başvuruları Gör
                            </button>
                            <button
                              onClick={() => handleExportCSV(event._id)}
                              disabled={event.appliedCount === 0}
                              className="border border-gray-200 bg-white text-gray-700 hover:text-teal-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download size={16} className="text-teal-600" />
                              CSV
                            </button>
                            <button
                              onClick={() => handleDelete(event._id, event.title)}
                              className="border border-red-100 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Başvurular */}
                        {apps && apps.length > 0 && (
                          <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100 rounded-lg">
                                  <th className="text-left px-3 py-2 text-gray-600 font-medium">Ad Soyad</th>
                                  <th className="text-left px-3 py-2 text-gray-600 font-medium">E-posta</th>
                                  <th className="text-left px-3 py-2 text-gray-600 font-medium">Telefon</th>
                                  <th className="text-left px-3 py-2 text-gray-600 font-medium">Şehir</th>
                                  <th className="text-left px-3 py-2 text-gray-600 font-medium">Tarih</th>
                                </tr>
                              </thead>
                              <tbody>
                                {apps.map((a) => (
                                  <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-2">{a.user?.name} {a.user?.surname}</td>
                                    <td className="px-3 py-2">{a.user?.email}</td>
                                    <td className="px-3 py-2">{a.user?.phone || '—'}</td>
                                    <td className="px-3 py-2">{a.user?.city || '—'}</td>
                                    <td className="px-3 py-2">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {apps && apps.length === 0 && (
                          <p className="mt-3 text-sm text-gray-400 text-center">Bu etkinliğe henüz başvuru yok.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
