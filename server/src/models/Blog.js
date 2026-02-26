const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.slug = `${baseSlug}-${Date.now()}`;
  }

  if (this.isModified('content')) {
    const words = this.content.replace(/<[^>]*>/g, '').replace(/</g, '').split(/\s+/).length;
    this.readTime = Math.ceil(words / 200);
  }

  next();
});

blogSchema.index({ title: 'text', tags: 'text' });
blogSchema.index({ authorId: 1, createdAt: -1 });
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ viewCount: -1 });

module.exports = mongoose.model('Blog', blogSchema);
