/**
 * Veritabanı Seed Script
 * Başlangıç admin kullanıcısını ve örnek verileri oluşturur.
 *
 * Kullanım: node src/seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const { ROLES } = require('./config/constants');

dotenv.config();

const seedDatabase = async (isLocalMemory = false) => {
  try {
    if (!isLocalMemory) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB bağlantısı kuruldu.');
    }

    // Mevcut admin var mı kontrol et
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log('ℹ️  Admin kullanıcı zaten mevcut. Seed işlemi atlanıyor.');
      await mongoose.disconnect();
      return;
    }

    // Admin kullanıcı oluştur
    const admin = await User.create({
      name: 'Sistem',
      surname: 'Yöneticisi',
      email: 'admin@sendegonulluol.com',
      password: 'SecureAdmin2026!',
      role: ROLES.ADMIN,
      city: 'Ardeşen',
      isActive: true,
    });
    console.log(`✅ Admin kullanıcı oluşturuldu: ${admin.email}`);

    // Örnek gönüllü kullanıcı
    const volunteer = await User.create({
      name: 'Ali',
      surname: 'Yılmaz',
      email: 'ali@example.com',
      password: 'GonulluUser2026',
      role: ROLES.VOLUNTEER,
      city: 'Rize',
      interests: ['çevre', 'eğitim', 'sağlık'],
      bio: 'Sosyal sorumluluk projelerine katılmayı seven bir üniversite öğrencisiyim.',
      isActive: true,
    });
    console.log(`✅ Gönüllü kullanıcı oluşturuldu: ${volunteer.email}`);

    // Örnek organizatör kullanıcı
    const organizer = await User.create({
      name: 'Ayşe',
      surname: 'Kaya',
      email: 'ayse@example.com',
      password: 'GreenWorldOrg26*',
      role: ROLES.ORGANIZER,
      city: 'Trabzon',
      organizationName: 'Yeşil Dünya Topluluğu',
      organizationDescription: 'Çevre ve doğa koruma etkinlikleri düzenleyen bir topluluk.',
      isActive: true,
    });
    console.log(`✅ Organizatör kullanıcı oluşturuldu: ${organizer.email}`);

    // Örnek etkinlikler oluştur
    const Event = require('./models/Event');
    const { EVENT_STATUS } = require('./config/constants');
    
    const eventsToCreate = [
      {
        title: 'Orman Temizliği Seferberliği',
        description: 'Bahar aylarının gelmesiyle birlikte ormanlarımızdaki atıkları temizlemek için bir araya geliyoruz. Tüm doğa severleri bekliyoruz. Doğamızı korumak geleceğimizi korumaktır.',
        category: 'Çevre',
        location: { city: 'Rize', address: 'Ayder Yaylası Yolu' },
        date: { start: '2026-06-10', end: '2026-06-11' },
        quota: 30,
        coverImage: '/uploads/img1.jpg',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      },
      {
        title: 'Köy Okullarına Kitap Yardımı',
        description: 'Dezavantajlı bölgelerdeki okullara kütüphane kurmak için kitap toplama ve tasnifleme etkinliği. Eğitime destek olmak isteyen herkesi bekleriz. Bilgi paylaştıkça çoğalır.',
        category: 'Eğitim',
        location: { city: 'Trabzon', address: 'Meydan Parkı Kitap Toplama Merkezi' },
        date: { start: '2026-06-15', end: '2026-06-15' },
        quota: 15,
        coverImage: '/uploads/img2.jpg',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      },
      {
        title: 'Sokak Hayvanları İçin Kulübe Yapımı',
        description: 'Yaklaşan kış ayları öncesi sokak dostlarımız için dayanıklı kulübeler inşa ediyoruz. Malzemeler bizden, el emeği sizden! Can dostlarımızı unutmayalım.',
        category: 'Hayvan Hakları',
        location: { city: 'Artvin', address: 'Belediye Hayvan Barınağı Yanı' },
        date: { start: '2026-06-20', end: '2026-06-21' },
        quota: 20,
        coverImage: '/uploads/img3.jpg',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      },
      {
        title: 'Sağlıklı Yaşam ve Yürüyüş',
        description: 'Hareketsiz yaşama karşı farkındalık oluşturmak için sahil boyunca toplu bir yürüyüş ve ardından sağlıklı beslenme semineri gerçekleştiriyoruz. Sağlam kafa sağlam vücutta bulunur.',
        category: 'Sağlık',
        location: { city: 'Ordu', address: 'Teleferik Alt İstasyonu Meydanı' },
        date: { start: '2026-06-25', end: '2026-06-25' },
        quota: 50,
        coverImage: '/uploads/img4.webp',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      },
      {
        title: 'İhtiyaç Sahiplerine Erzak Hazırlığı',
        description: 'İhtiyaç sahibi ailelere ulaştırılacak erzak kolilerinin hazırlanması ve araçlara yüklenmesi için gönüllü desteğine ihtiyacımız var. Birlikten kuvvet doğar.',
        category: 'Sosyal Yardım',
        location: { city: 'Giresun', address: 'Liman Mevkii Depo Alanı' },
        date: { start: '2026-07-01', end: '2026-07-02' },
        quota: 40,
        coverImage: '/uploads/img5.webp',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      },
      {
        title: 'Yazlık Sinema ve Sanat Şenliği',
        description: 'Çocuklara yönelik açık hava sineması gösterimi ve yüz boyama/resim atölyesi. Eğlenceli bir hafta sonu için bize katılın. Sanatla büyüyen nesiller.',
        category: 'Kültür & Sanat',
        location: { city: 'Samsun', address: 'Atakum Sahili Amfi Tiyatro' },
        date: { start: '2026-07-10', end: '2026-07-10' },
        quota: 25,
        coverImage: '/uploads/img6.jpeg',
        organizer: organizer._id,
        status: EVENT_STATUS.APPROVED
      }
    ];
    
    await Event.insertMany(eventsToCreate);
    console.log(`✅ ${eventsToCreate.length} adet örnek etkinlik oluşturuldu.`);

    console.log('');
    console.log('Seed işlemi tamamlandı!');
    console.log('');
    console.log('Oluşturulan hesaplar:');
    console.log('┌──────────────────────────────────┬───────────────┬─────────────────┐');
    console.log('│ E-posta                          │ Şifre         │ Rol             │');
    console.log('├──────────────────────────────────┼───────────────┼─────────────────┤');
    console.log('│ admin@sendegonulluol.com         │ Admin123!     │ Admin           │');
    console.log('│ ali@example.com                  │ Gonullu123    │ Gönüllü         │');
    console.log('│ ayse@example.com                 │ Organizer123  │ Organizatör     │');
    console.log('└──────────────────────────────────┴───────────────┴─────────────────┘');

    if (!isLocalMemory) {
      await mongoose.disconnect();
      console.log('✅ MongoDB bağlantısı kapatıldı.');
    }
  } catch (error) {
    console.error('❌ Seed hatası:', error.message);
    if (!isLocalMemory) process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
