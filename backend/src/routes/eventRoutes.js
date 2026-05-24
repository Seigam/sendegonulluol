const express = require('express');
const router = express.Router();

const {
  createEvent,
  getEvents,
  getManagedEvents,
  getEventById,
  deleteEvent,
  updateEventStatus,
  completeEvent,
} = require('../controllers/eventController');

const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createEventValidation,
  updateEventStatusValidation,
} = require('../middlewares/validators');

/**
 * Event Route'ları
 *
 * Public
 * GET    /api/events         - Onaylı tüm etkinlikleri listele
 * GET    /api/events/:id     - Belirli etkinlik detayını görüntüle
 *
 * Private (Yönetim & Düzenleme)
 * POST   /api/events         - Yeni etkinlik oluştur (Sadece Organizer/Admin)
 * GET    /api/events/manage  - Yönetilen etkinlikleri listele (Sadece Organizer/Admin)
 * DELETE /api/events/:id     - Etkinlik sil (Sadece oluşturucu Organizer/Admin)
 * PATCH  /api/events/:id/status - Etkinlik durumunu onayla/reddet (Sadece Admin)
 */

// --- Public Endpoints ---
router.get('/', getEvents);

// --- Private Endpoints ---

// İsteğe bağlı olarak public getEventById en altta bırakılmalıdır veya
// diğer string routes ile çakışmaması için manage yukarıda olmalıdır.
router.get('/manage', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), getManagedEvents);

// --- Public Endpoint (Specific ID) ---
router.get('/:id', getEventById);

// --- Private Endpoints (Action) ---
router.post('/', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), createEventValidation, createEvent);

router.delete('/:id', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), deleteEvent);

// Sadece Admin (Onay/Red işlemleri)
router.patch('/:id/status', auth, authorize(ROLES.ADMIN), updateEventStatusValidation, updateEventStatus);

// Organizatör ve Admin (Etkinliği sonuçlandır)
router.patch('/:id/complete', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), completeEvent);

module.exports = router;
