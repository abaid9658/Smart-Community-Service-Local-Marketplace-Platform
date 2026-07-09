import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';
import { AppError } from './error.middleware';
import path from 'path';
import streamifier from 'streamifier';

// ── Memory storage (buffers files in RAM before Cloudinary upload) ───
const memoryStorage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400));
  }
};

// ── Upload a single buffer to Cloudinary ─────────────────────────────
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `localhub/${folder}`,
        quality: 'auto',
        fetch_format: 'auto',
        ...options,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const uploadProductImages = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

export const uploadServiceImages = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

export const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

export const uploadChatMedia = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

