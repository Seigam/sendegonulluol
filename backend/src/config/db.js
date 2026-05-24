const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Önce gerçek MongoDB'ye bağlanmayı dene
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ MongoDB Bağlantısı Başarılı: ${mongoose.connection.host}`);
        return;
      } catch {
        // Gerçek MongoDB yoksa bellek içi sunucu başlat
        console.log('⚠️  Yerel MongoDB bulunamadı, bellek içi MongoDB başlatılıyor...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        
        // Bellek içi DB kullanılıyorsa, otomatik seed yap
        await mongoose.connect(uri);
        const { seedDatabase } = require('../seed');
        await seedDatabase(true);
        return;
      }
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Bağlantısı Başarılı: ${mongoose.connection.host}`);

    if (mongoServer) {
      console.log('ℹ️  Bellek içi MongoDB kullanılıyor (veriler sunucu kapatıldığında silinir)');
    }
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1);
  }
};

// Temiz kapatma için
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
