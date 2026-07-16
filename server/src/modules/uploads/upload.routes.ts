import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router, type RequestHandler } from 'express';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { uploadImage } from '../../lib/cloudinary';
import { isCloudinaryConfigured } from '../../config/env';
import { ApiError } from '../../utils/api-error';
import { UPLOADS_DIR } from '../../app';

export const uploadRoutes = Router();

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** Persists uploaded images to Cloudinary when configured, otherwise to local disk. */
async function persist(files: Express.Multer.File[], baseUrl: string): Promise<string[]> {
  if (isCloudinaryConfigured) {
    return Promise.all(files.map((f) => uploadImage(f.buffer)));
  }
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  return Promise.all(
    files.map(async (file) => {
      const ext = EXT_BY_MIME[file.mimetype] ?? 'jpg';
      const name = `${crypto.randomUUID()}.${ext}`;
      await fs.writeFile(path.join(UPLOADS_DIR, name), file.buffer);
      return `${baseUrl}/uploads/${name}`;
    })
  );
}

const handleUpload: RequestHandler = async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length === 0) throw ApiError.badRequest('Nenhuma imagem enviada');
    const urls = await persist(files, `${req.protocol}://${req.get('host')}`);
    res.status(201).json({ urls });
  } catch (err) {
    next(err);
  }
};

// Admin: product images (up to 6)
uploadRoutes.post('/', requireAdmin, upload.array('images', 6), handleUpload);

// Any signed-in customer: review photos (up to 4)
uploadRoutes.post('/reviews', requireAuth, upload.array('images', 4), handleUpload);
