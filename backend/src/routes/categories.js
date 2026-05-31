import { Router } from 'express';
import Category from '../models/Category.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/apiResponse.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, { categories });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw new AppError('Category not found', 404);
  sendSuccess(res, { category });
}));

router.post('/', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  sendSuccess(res, { category }, 'Category created', 201);
}));

router.patch('/:id', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  sendSuccess(res, { category }, 'Category updated');
}));

router.delete('/:id', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, {}, 'Category deactivated');
}));

export default router;
