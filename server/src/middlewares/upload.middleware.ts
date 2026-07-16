import multer from 'multer';
import { ApiError } from '../utils/api-error';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Formato de imagem não suportado (use JPG, PNG, WEBP ou AVIF)'));
    }
    cb(null, true);
  },
});
