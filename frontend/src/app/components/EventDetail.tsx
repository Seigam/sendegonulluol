import { getImageUrl } from '../../services/api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, HeartHandshake } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getEventById } from '../../services/eventService';
import { toast } from 'sonner';
import type { Event } from '../../services/eventService';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applyForEvent, myApplications, fetchMyApplications } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEventById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));

    fetchMyApplications();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Etkinlik bulunamadı</h2>
        <button onClick={() => navigate('/home')} className="mt-4 text-teal-600 hover:underline">
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  const hasApplied = myApplications.some((a) => a.event?._id === id);
  const progressPercentage = Math.min(100, Math.round((event.appliedCount / event.quota) * 100));
  const isFull = event.appliedCount >= event.quota;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyForEvent(event._id, note);
      await fetchMyApplications();
      toast.success('Başvurunuz başarıyla alındı! Organizatörden haber bekleniyor.');
    } catch (err: any) {
      toast.error(err.message || 'Başvuru yapılamadı.');
    } finally {
      setIsApplying(false);
    }
  };

  const organizerName = event.organizer?.organizationName ||
    `${event.organizer?.name || ''} ${event.organizer?.surname || ''}`.trim();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Geri dön
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="h-64 sm:h-80 md:h-96 w-full relative">
          {event.coverImage ? (
            <img src={getImageUrl(event.coverImage)} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-teal-700 flex items-center justify-center">
              <HeartHandshake size={64} className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-10">

          {/* Ana İçerik */}
          <div className="flex-1 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Etkinlik Hakkında</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Organizatör</h2>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xl">
                  {organizerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{organizerName}</h3>
                  <p className="text-sm text-gray-500">Doğrulanmış Topluluk</p>
                </div>
              </div>
            </section>
          </div>

          {/* Başvuru Kartı */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24 space-y-6">

              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium text-gray-900">
                    {new Date(event.date.start).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                  </p>
                  {event.date.end && event.date.end !== event.date.start && (
                    <p className="text-sm text-gray-400">
                      → {new Date(event.date.end).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Konum</p>
                  <p className="font-medium text-gray-900">{event.location.city}</p>
                  <p className="text-sm text-gray-400">{event.location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Gönüllü Durumu</p>
                  <div className="flex justify-between items-end mt-1 mb-2">
                    <p className="font-medium text-gray-900">{event.appliedCount} / {event.quota} kişi</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                {hasApplied ? (
                  <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="font-semibold">Başvurunuz Alındı</p>
                    <p className="text-sm">Organizatörden haber bekleniyor.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Organizatöre notunuz veya motivasyonunuz (isteğe bağlı)..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={isApplying || isFull}
                    />
                    <button
                      onClick={handleApply}
                      disabled={isApplying || isFull}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <HeartHandshake size={20} />
                          Hemen Başvur
                        </>
                      )}
                    </button>
                  </div>
                )}
                {isFull && !hasApplied && (
                  <p className="text-red-500 text-sm text-center mt-2">Kontenjan dolmuştur.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
