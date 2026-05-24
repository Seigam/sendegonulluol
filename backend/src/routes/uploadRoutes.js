const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generate a unique filename: fieldname-timestamp-extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Sadece görsel (JPG, JPEG, PNG, WEBP) dosyaları yüklenebilir!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Görsel yükle
// @route   POST /api/upload
// @access  Public (or require auth)
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Lütfen bir dosya seçin.' });
  }

  // Relative path döndür — Frontend proxy üzerinden erişecek
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({
    success: true,
    message: 'Görsel başarıyla yüklendi',
    url: fileUrl,
  });
});

module.exports = router;
