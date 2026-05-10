// Kullanıcı Rolleri
const ROLES = {
  VOLUNTEER: 'volunteer',   // Gönüllü
  ORGANIZER: 'organizer',   // Organizatör / Topluluk Yöneticisi
  ADMIN: 'admin',           // Sistem Yöneticisi
};

// Etkinlik Durumları
const EVENT_STATUS = {
  PENDING: 'pending',       // Onay Bekliyor
  APPROVED: 'approved',     // Onaylandı
  REJECTED: 'rejected',     // Reddedildi
  CANCELLED: 'cancelled',   // İptal Edildi
  COMPLETED: 'completed',   // Tamamlandı
};

// Başvuru Durumları
const APPLICATION_STATUS = {
  PENDING: 'pending',       // Beklemede
  ACCEPTED: 'accepted',     // Kabul Edildi
  REJECTED: 'rejected',     // Reddedildi
  WITHDRAWN: 'withdrawn',   // Geri Çekildi
};

// Rütbe / Rozet Sistemi (Oyunlaştırma)
const BADGES = [
  { name: 'Çaylak Gönüllü', minEvents: 1, icon: '🌱' },
  { name: 'Aktif Gönüllü', minEvents: 3, icon: '⭐' },
  { name: 'Deneyimli Gönüllü', minEvents: 5, icon: '🏅' },
  { name: 'Uzman Gönüllü', minEvents: 10, icon: '🏆' },
  { name: 'Efsane Gönüllü', minEvents: 25, icon: '💎' },
];

module.exports = {
  ROLES,
  EVENT_STATUS,
  APPLICATION_STATUS,
  BADGES,
};
