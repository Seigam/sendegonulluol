const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  applyForEvent,
  getMyApplications,
  getEventApplications,
  exportApplicationsCSV,
  withdrawApplication,
  completeApplication,
} = require('../controllers/applicationController');

/**
 * Application Route'ları
 *
 * POST   /api/applications/:eventId         - Etkinliğe başvur (Volunteer)
 * GET    /api/applications/my               - Kendi başvurularım
 * GET    /api/applications/event/:eventId   - Etkinlik başvuruları (Org/Admin)
 * GET    /api/applications/event/:eventId/csv - CSV dışa aktar (Org/Admin)
 * DELETE /api/applications/:id             - Başvuruyu geri çek
 * PATCH  /api/applications/:id/complete    - Tamamlandı işaretle (Admin)
 */

// Kendi başvurularım (önce, :eventId ile çakışmasın diye)
router.get('/my', auth, getMyApplications);

// Etkinlik başvuruları (Org/Admin)
router.get('/event/:eventId', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), getEventApplications);

// CSV dışa aktar
router.get('/event/:eventId/csv', auth, authorize(ROLES.ORGANIZER, ROLES.ADMIN), exportApplicationsCSV);

// Etkinliğe başvur
router.post('/:eventId', auth, applyForEvent);

// Başvuruyu geri çek
router.delete('/:id', auth, withdrawApplication);

// Tamamlandı işaretle (Admin)
router.patch('/:id/complete', auth, authorize(ROLES.ADMIN), completeApplication);

module.exports = router;
