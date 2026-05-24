import { getImageUrl } from '../services/api';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, ExternalLink, RefreshCw, List } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router';
import { completeEvent } from '../../services/eventService';
import { toast } from 'sonner';

export function AdminPanel() {
  const { managedEvents, fetchManagedEvents, updateEventStatus, currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ eventId: string; title: string } | null>(null);
  const [adminMessage, setAdminMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchManagedEvents();
  }, []);

  const pendingEvents = managedEvents.filter((e) => e.status === 'pending');
  const approvedEvents = managedEvents.filter((e) => e.status === 'approved');

  const displayedEvents = activeTab === 'pending' ? pendingEvents : approvedEvents;

  const handleApprove = async (id: string) => {
    try {
      await updateEventStatus(id, 'approved');
      toast.success('Etkinlik onaylandı ve ana sayfada yayınlandı.');
    } catch (err: any) {
      toast.error(err.message || 'İşlem başarısız.');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await updateEventStatus(rejectModal.eventId, 'rejected', adminMessage);
      toast.error('Etkinlik reddedildi.');
      setRejectModal(null);
      setAdminMessage('');
    } catch (err: any) {
      toast.error(err.message || 'İşlem başarısız.');
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchManagedEvents();
    setLoading(false);
  };

  const handleCompleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" etkinliğini sonuçlandırmak istediğinize emin misiniz? Katılan gönüllülerin ödülleri dağıtılacaktır.`)) return;
    try {
      await completeEvent(id);
      toast.success('Etkinlik sonuçlandırıldı ve gönüllülere ödülleri dağıtıldı!');
      fetchManagedEvents();
    } catch (err: any) {
      toast.error(err.message || 'Etkinlik sonuçlandırılamadı.');
    }
  };

  if (currentUser?.role !== 'admin') {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Onay Paneli</h1>
          <p className="text-gray-500">Sisteme eklenen etkinlikleri inceleyin, onaylayın veya reddedin.</p>
        </div>
        <button onClick={refresh} disabled={loading} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 border border-teal-200 rounded-lg px-3 py-2 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="flex border-b border-gray-100">
          {(['pending', 'approved'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 flex justify-center items-center gap-2 font-medium transition-colors ${activeTab === tab ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'pending' ? (
                <>
                  <List size={20} /> Bekleyen Etkinlikler 
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">{pendingEvents.length}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} /> Onaylanmış Etkinlikler
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">{approvedEvents.length}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="p-0">
          {displayedEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === 'pending' ? 'bg-green-50' : 'bg-gray-50'}`}>
                {activeTab === 'pending' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <List className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{activeTab === 'pending' ? 'Bekleyen etkinlik yok' : 'Onaylanmış etkinlik yok'}</h3>
              <p className="text-gray-500">{activeTab === 'pending' ? 'Tüm etkinlikler incelenmiş. Harika iş çıkardınız!' : 'Şu anda sistemde yayınlanan bir etkinlik bulunmuyor.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {displayedEvents.map((event) => (
                <li key={event._id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {event.coverImage && (
                      <div className="w-full md:w-48 h-32 flex-shrink-0">
                        <img
                          src={getImageUrl(event.coverImage)}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-3">
                            <span className="bg-teal-50 px-2 py-0.5 rounded-md">
                              {event.organizer?.organizationName || `${event.organizer?.name} ${event.organizer?.surname}`}
                            </span>
                            <span className="bg-teal-50 px-2 py-0.5 rounded-md">{event.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(event._id)}
                                className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 hover:border-green-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                              >
                                <CheckCircle size={18} />
                                Onayla
                              </button>
                              <button
                                onClick={() => setRejectModal({ eventId: event._id, title: event.title })}
                                className="bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                              >
                                <XCircle size={18} />
                                Reddet
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCompleteEvent(event._id, event.title)}
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <CheckCircle size={18} />
                              Sonuçlandır
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          {new Date(event.date.start).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} />
                          {event.location.city} — {event.location.address}
                        </span>
                        <span><strong>Kontenjan:</strong> {event.quota} Kişi</span>
                        <Link to={`/event/${event._id}`} className="ml-auto flex items-center gap-1 text-teal-600 hover:underline font-medium text-sm">
                          Detayları Gör <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Reddetme Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Etkinliği Reddet</h3>
            <p className="text-gray-500 text-sm mb-4">
              <span className="font-medium text-gray-700">"{rejectModal.title}"</span> etkinliğini reddetmek üzeresiniz.
              Organizatöre iletilecek bir not ekleyebilirsiniz (isteğe bağlı).
            </p>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 resize-none mb-4"
              placeholder="Ret sebebi (isteğe bağlı)..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setAdminMessage(''); }}
                className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-medium hover:bg-red-700 transition-colors"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
