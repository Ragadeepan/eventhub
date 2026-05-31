import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, maxlength: 500 },
  icon:        { type: String, required: true },
  color:       { type: String, default: '#6366f1' },
  gradient:    { type: String, default: 'from-indigo-500 to-purple-600' },
  image:       String,
  imagePublicId: String,
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  eventCount:  { type: Number, default: 0 },
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  seoMeta:     { title: String, description: String },
}, { timestamps: true });

categorySchema.index({ isActive: 1, sortOrder: 1 });

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

export default mongoose.model('Category', categorySchema);
