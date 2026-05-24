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

    // Örnek etkinlikler oluşturma işlemi kapatıldı
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
