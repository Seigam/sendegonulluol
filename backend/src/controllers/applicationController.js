const Application = require('../models/Application');
const Event = require('../models/Event');
const User = require('../models/User');
const { APPLICATION_STATUS, BADGES } = require('../config/constants');

/**
 * @desc    Etkinliğe başvur
 * @route   POST /api/applications/:eventId
 * @access  Private (Volunteer)
 */
const applyForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı.' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Bu etkinliğe henüz başvurulamaz.' });
    }

    if (event.appliedCount >= event.quota) {
      return res.status(400).json({ success: false, message: 'Etkinlik kontenjanı doldu.' });
    }

    // Mükerrer başvuru kontrolü
    const existing = await Application.findOne({ event: req.params.eventId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu etkinliğe zaten başvurdunuz.' });
    }

    const application = await Application.create({
      event: req.params.eventId,
      user: req.user.id,
      note: req.body.note || '',
    });

    // Başvuru sayacını güncelle
    await Event.findByIdAndUpdate(req.params.eventId, { $inc: { appliedCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Başvurunuz alındı!',
      data: { application },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bu etkinliğe zaten başvurdunuz.' });
    }
    next(error);
  }
};

/**
 * @desc    Kullanıcının kendi başvurularını listele
 * @route   GET /api/applications/my
 * @access  Private
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('event', 'title category date location status coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bir etkinliğin başvurularını listele (Organizer / Admin)
 * @route   GET /api/applications/event/:eventId
 * @access  Private (Organizer, Admin)
 */
const getEventApplications = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı.' });
    }

    // Organizatör sadece kendi etkinliğini görebilir
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu etkinliğin başvurularını görme yetkiniz yok.' });
    }

    const applications = await Application.find({ event: req.params.eventId })
      .populate('user', 'name surname email phone city')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinlik başvurularını CSV olarak dışa aktar
 * @route   GET /api/applications/event/:eventId/csv
 * @access  Private (Organizer, Admin)
 */
const exportApplicationsCSV = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı.' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yok.' });
    }

    const applications = await Application.find({ event: req.params.eventId })
      .populate('user', 'name surname email phone city')
      .sort({ createdAt: -1 });

    // CSV oluştur
    const headers = ['Ad', 'Soyad', 'E-posta', 'Telefon', 'Şehir', 'Başvuru Tarihi', 'Durum'];
    const rows = applications.map((a) => [
      a.user?.name || '',
      a.user?.surname || '',
      a.user?.email || '',
      a.user?.phone || '',
      a.user?.city || '',
      new Date(a.createdAt).toLocaleDateString('tr-TR'),
      a.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `${event.title.replace(/\s+/g, '_')}_Basvurular.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send('\uFEFF' + csvContent); // BOM karakteri Excel için
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Başvuruyu geri çek
 * @route   DELETE /api/applications/:id
 * @access  Private (Başvuru sahibi)
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı.' });
    }

    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu başvuruyu geri çekme yetkiniz yok.' });
    }

    await application.deleteOne();
    await Event.findByIdAndUpdate(application.event, { $inc: { appliedCount: -1 } });

    res.status(200).json({ success: true, message: 'Başvurunuz geri çekildi.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinliği tamamla ve oyunlaştırma rozet hesapla
 * @route   PATCH /api/applications/:id/complete
 * @access  Private (Admin)
 */
const completeApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı.' });
    }

    application.status = APPLICATION_STATUS.ACCEPTED;
    await application.save();

    // Kullanıcının tamamlanan etkinlik sayısını artır ve rozet kontrolü yap
    const user = await User.findById(application.user);
    if (user) {
      user.completedEventsCount += 1;

      // Rozet kontrolü
      const earned = BADGES.filter((b) => b.minEvents <= user.completedEventsCount);
      if (earned.length > 0) {
        const latestBadge = earned[earned.length - 1];
        const alreadyHas = user.badges.some((b) => b.name === latestBadge.name);
        if (!alreadyHas) {
          user.badges.push({ name: latestBadge.name, icon: latestBadge.icon });
          user.currentRank = latestBadge.name;
        }
      }
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Başvuru tamamlandı olarak işaretlendi.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForEvent,
  getMyApplications,
  getEventApplications,
  exportApplicationsCSV,
  withdrawApplication,
  completeApplication,
};
