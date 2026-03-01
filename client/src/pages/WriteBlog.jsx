import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function WriteBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [loading, setLoading] = useState(false)
  const editorRef = useRef(null)
  const QuillRef = useRef(null)
  const [quillLoaded, setQuillLoaded] = useState(false)

  useEffect(() => {
    import('react-quill-new').then((mod) => {
      QuillRef.current = mod.default
      setQuillLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (id) fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    try {
      const { data } = await API.get(`/blogs/${id}`)
      setTitle(data.blog.title)
      setContent(data.blog.content)
      setTags(data.blog.tags?.join(', ') || '')
      setCoverImage(data.blog.coverImage || '')
    } catch (error) {
      toast.error('Failed to load blog')
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (published) => {
    if (!title.trim() || !content.trim()) {
      return toast.error('Title and content are required')
    }
    setLoading(true)
    try {
      const payload = {
        title,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage,
        published,
      }

      if (id) {
        await API.put(`/blogs/${id}`, payload)
        toast.success('Blog updated!')
      } else {
        await API.post('/blogs', payload)
        toast.success(published ? 'Blog published!' : 'Draft saved!')
      }
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const ReactQuill = QuillRef.current

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Blog' : 'Write a Blog'}</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {coverImage && <img src={coverImage} alt="Cover" className="mt-2 h-40 object-cover rounded-lg" />}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your amazing blog title..."
            className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          {quillLoaded && ReactQuill ? (
            <ReactQuill
              ref={editorRef}
              theme="snow"
              value={content}
              onChange={setContent}
              className="bg-white dark:bg-gray-700 rounded-lg"
              style={{ minHeight: '300px' }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote', 'code-block'],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here... (HTML supported)"
              rows={12}
              className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="javascript, react, webdev"
            className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-6 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
