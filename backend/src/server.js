const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// .env dosyasını yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// ---------- GÜVENLİK MIDDLEWARE'LERİ ----------

// Helmet - HTTP güvenlik başlıkları
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting - Brute force koruması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP'den 15 dakikada en fazla 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyiniz.',
  },
});
app.use('/api/', limiter);

// Auth endpoint'leri için daha sıkı rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Auth için 15 dakikada en fazla 20 istek
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyiniz.',
  },
});

// ---------- BODY PARSER ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- API ROUTE'LARI ----------

// Karşılama endpoint'i
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🤝 Sen de Gönüllü Ol API - Hoş Geldiniz!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
    },
  });
});

// Auth route'ları
app.use('/api/auth', authLimiter, authRoutes);

// Kullanıcı route'ları
app.use('/api/users', userRoutes);

// Etkinlik route'ları
app.use('/api/events', eventRoutes);

// Başvuru route'ları
app.use('/api/applications', applicationRoutes);

// ---------- HATA YÖNETİMİ ----------

// 404 - Bulunamadı
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `İstenen kaynak bulunamadı: ${req.originalUrl}`,
  });
});

// Genel hata yakalayıcı
app.use(errorHandler);

// ---------- SUNUCUYU BAŞLAT ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // MongoDB'ye bağlan
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║   🤝 Sen de Gönüllü Ol - Backend API         ║');
      console.log(`║   🚀 Sunucu çalışıyor: http://localhost:${PORT}  ║`);
      console.log(`║   📦 Ortam: ${process.env.NODE_ENV || 'development'}                    ║`);
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Sunucu başlatılamadı:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
