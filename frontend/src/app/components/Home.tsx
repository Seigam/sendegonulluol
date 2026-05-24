import { getImageUrl } from '../../services/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CATEGORIES = ['Çevre', 'Doğa', 'Eğitim', 'Hayvan Hakları', 'Sağlık', 'Sosyal Yardım', 'Kültür & Sanat', 'Spor'];

export function Home() {
  const { events, fetchEvents, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // İlk yüklemede ve filtre değişiminde API'yi çağır
  useEffect(() => {
    fetchEvents({
      search: searchTerm || undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
    });
  }, []);

  const handleSearch = () => {
    fetchEvents({
      search: searchTerm || undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
    });
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    fetchEvents({
      search: searchTerm || undefined,
      category: cat !== 'All' ? cat : undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-teal-700 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Gönüllülüğe Adım At, Dünyayı Değiştir</h1>
          <p className="text-teal-100 text-lg md:text-xl mb-6">
            Senin gibi binlerce insanla birlikte topluluğumuz için çalışıyoruz. İlgini çeken bir etkinlik bul ve hemen başvur.
          </p>
        </div>
      </div>

      {/* Arama & Filtre */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Etkinlik ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 hidden md:block" />
          <select
            className="block w-full md:w-52 pl-3 pr-10 py-2 text-base border border-gray-200 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg"
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="All">Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors"
          >
            Ara
          </button>
        </div>
      </div>

      {/* Etkinlik Listesi */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Yaklaşan Etkinlikler</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">Arama kriterlerinize uygun etkinlik bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const organizerName = event.organizer?.organizationName ||
                `${event.organizer?.name || ''} ${event.organizer?.surname || ''}`.trim();

              return (
                <Link
                  key={event._id}
                  to={`/event/${event._id}`}
                  className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {event.coverImage ? (
                      <img
                        src={getImageUrl(event.coverImage)}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-teal-100 flex items-center justify-center">
                        <span className="text-5xl">🤝</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
  
                    <div className="mt-auto space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-teal-500" />
                        <span>{new Date(event.date.start).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-teal-500" />
                        <span className="truncate">{event.location.city} — {event.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-teal-500" />
                        <span>{organizerName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
