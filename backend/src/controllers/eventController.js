const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Application = require('../models/Application');
const User = require('../models/User');
const { ROLES, EVENT_STATUS, APPLICATION_STATUS, BADGES } = require('../config/constants');

/**
 * @desc    Yeni etkinlik taslağı oluştur
 * @route   POST /api/events
 * @access  Private (Sadece Organizer ve Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası.',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { title, description, category, location, date, quota, coverImage } = req.body;

    // Etkinlik oluştur (durumu varsayılan olarak PENDING olacaktır)
    const event = await Event.create({
      title,
      description,
      category,
      location,
      date: {
        start: date.start,
        end: date.end || date.start, // bitiş tarihi verilmezse başlangıç ile aynı
      },
      quota,
      coverImage: coverImage || '',
      organizer: req.user.id,
      status: req.user.role === ROLES.ADMIN ? EVENT_STATUS.APPROVED : EVENT_STATUS.PENDING, 
      // Admin oluşturursa otomatik onaylı sayılabilir, organizatör ise onay bekler.
    });


    res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu. Yönetici onayının ardından listelenecektir.',
      data: {
        event: event.toSafeObject(true),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Tüm onaylı etkinlikleri listele / Filtrele
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sadece onaylanmış etkinlikleri göster
    const filter = { status: EVENT_STATUS.APPROVED };

    // Filtreleme mantığı
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.city) {
      filter['location.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Arama
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('organizer', 'name surname organizationName avatar')
      .skip(skip)
      .limit(limit)
      .sort({ 'date.start': 1 }); // Yakın tarihe göre sırala

    res.status(200).json({
      success: true,
      data: {
        events: events.map((e) => e.toSafeObject()),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Organizatörün kendi etkinliklerini (onay bekleyen vs.) veya Adminin tüm etkinlikleri listelemesi
 * @route   GET /api/events/manage
 * @access  Private (Organizer, Admin)
 */
const getManagedEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let filter = {};

    // Eğer arayan admin değilse sadece kendi etkinliklerini görsün
    if (req.user.role !== ROLES.ADMIN) {
      filter.organizer = req.user.id;
    }

    // İstenirse duruma göre filtre (örneğin sadece pending olanlar listelensin admins için)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('organizer', 'name surname organizationName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        events: events.map((e) => e.toSafeObject(true)),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinlik detayını getir
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name surname organizationName bio avatar city');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.',
      });
    }

    // İsteği yapan kişi admin veya organizatör (kendi etkinliği ise) daha fazla veri görebilir
    const isAdminOrOwner = 
      req.user && 
      (req.user.role === ROLES.ADMIN || req.user.id === event.organizer._id.toString());

    // Sadece onaylanmış, veya kullanıcının kendisi/admin ise diğerlerini görsün
    if (!isAdminOrOwner && event.status !== EVENT_STATUS.APPROVED) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı veya henüz onaylanmadı.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        event: event.toSafeObject(isAdminOrOwner),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinliği sil
 * @route   DELETE /api/events/:id
 * @access  Private (Organizer, Admin)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.',
      });
    }

    // Sadece Admin veya etkinliği oluşturan Organizer silebilir
    if (req.user.role !== ROLES.ADMIN && req.user.id !== event.organizer.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği silme yetkiniz yok.',
      });
    }

    // Eğer etkinlik tamamlandıysa silinemez gibi kurallar koyulabilir.
    if (event.status === EVENT_STATUS.COMPLETED && req.user.role !== ROLES.ADMIN) {
        return res.status(400).json({
            success: false,
            message: 'Tamamlanmış etkinlikler silinemez.',
        });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla silindi.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinliği Onayla / Reddet (Admin Onay Mantığı)
 * @route   PATCH /api/events/:id/status
 * @access  Private (Sadece Admin)
 */
const updateEventStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası.',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { status, adminMessage } = req.body;
    
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.',
      });
    }

    event.status = status;
    if (adminMessage !== undefined) {
      event.adminMessage = adminMessage;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: `Etkinlik durumu başarıyla '${status}' olarak güncellendi.`,
      data: {
        event: event.toSafeObject(true),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Etkinliği Sonuçlandır ve Başvuruları Tamamla
 * @route   PATCH /api/events/:id/complete
 * @access  Private (Organizer, Admin)
 */
const completeEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Etkinlik bulunamadı.' });
    }

    // Yetki Kontrolü
    if (req.user.role !== ROLES.ADMIN && req.user.id !== event.organizer.toString()) {
      return res.status(403).json({ success: false, message: 'Bu etkinliği sonuçlandırma yetkiniz yok.' });
    }

    if (event.status !== EVENT_STATUS.APPROVED) {
      return res.status(400).json({ success: false, message: 'Sadece onaylanmış etkinlikler sonuçlandırılabilir.' });
    }

    // Etkinliği tamamlandı yap
    event.status = EVENT_STATUS.COMPLETED;
    await event.save();

    // Bu etkinliğe ait geçerli başvuruları bul
    const applications = await Application.find({
      event: event._id,
      status: { $in: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.ACCEPTED] }
    });

    let rewardedCount = 0;

    for (const application of applications) {
      // Başvuruyu onaylandı olarak güncelle
      application.status = APPLICATION_STATUS.ACCEPTED;
      await application.save();

      // Kullanıcıyı güncelle
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
        rewardedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Etkinlik başarıyla sonuçlandırıldı ve ${rewardedCount} gönüllü ödüllendirildi!`,
      data: {
        event: event.toSafeObject(true),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getManagedEvents,
  getEventById,
  deleteEvent,
  updateEventStatus,
  completeEvent,
};
