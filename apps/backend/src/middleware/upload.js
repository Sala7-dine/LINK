import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const createUploader = (allowed, errorMessage, maxFileSize) =>
  multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(errorMessage), false);
      }
    },
    limits: { fileSize: maxFileSize || parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  });

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Use JPEG, PNG, WEBP or PDF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const uploadCsv = createUploader(
  ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'],
  'File type not allowed. Use CSV.',
  parseInt(process.env.MAX_CSV_FILE_SIZE) || 2 * 1024 * 1024
);

export default upload;
export { uploadCsv };
