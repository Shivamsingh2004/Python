import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const WriteBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const res = await api.get(`/blogs/user/${user._id}`);
          const blog = res.data.blogs.find((b) => b._id === id);
          if (blog) {
            setForm({
              title: blog.title,
              content: blog.content,
              tags: blog.tags?.join(', ') || '',
            });
            setCoverPreview(blog.coverImage || '');
          }
        } catch {
          // ignore
        }
      };
      fetchBlog();
    }
  }, [id, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const submitBlog = async (published) => {
    if (!form.title.trim() || !form.content.trim()) {
      return setError('Title and content are required.');
    }

    setError('');
    published ? setPublishing(true) : setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      formData.append('published', String(published));
      if (coverImage) formData.append('coverImage', coverImage);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEditing) {
        await api.put(`/blogs/${id}`, formData, config);
      } else {
        await api.post('/blogs', formData, config);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Blog' : 'Write New Blog'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => submitBlog(false)}
            disabled={saving || publishing}
            className="btn-secondary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => submitBlog(true)}
            disabled={saving || publishing}
            className="btn-primary disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Cover Image */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors overflow-hidden"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Click to upload cover image</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Title */}
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Your blog title..."
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
        />

        {/* Tags */}
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="Add tags (comma separated): javascript, react, webdev"
          className="input-field text-sm"
        />

        {/* Editor */}
        <div className="min-h-[400px]">
          <ReactQuill
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            modules={QUILL_MODULES}
            placeholder="Tell your story..."
            theme="snow"
            className="h-96"
          />
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
