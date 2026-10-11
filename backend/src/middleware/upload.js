const multer = require('multer');
const path = require('path');

// Memory storage for forwarding bytes to ML Service or parsing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) && allowedImageTypes.test(file.mimetype);
  const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf' || file.mimetype === 'application/pdf';

  if (isImage || isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP images and PDF documents are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
