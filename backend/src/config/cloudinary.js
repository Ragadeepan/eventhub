import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']) =>
  new CloudinaryStorage({ cloudinary, params: { folder: `eventhub/${folder}`, allowed_formats: allowedFormats, transformation: [{ quality: 'auto', fetch_format: 'auto' }] } });

export const uploadEventBanner  = multer({ storage: createStorage('event-banners'), limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadEventGallery = multer({ storage: createStorage('event-gallery'), limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadAvatar       = multer({ storage: createStorage('avatars'), limits: { fileSize: 2 * 1024 * 1024 } });
export const uploadDocument     = multer({ storage: createStorage('documents', ['pdf', 'doc', 'docx']), limits: { fileSize: 10 * 1024 * 1024 } });

export const deleteCloudinaryImage = async (publicId) => {
  try { await cloudinary.uploader.destroy(publicId); } catch (err) { console.error('Cloudinary delete error:', err); }
};

export { cloudinary };
