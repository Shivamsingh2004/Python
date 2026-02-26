import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [drafts, setDrafts] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [tab, setTab] = useState('published')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pubRes, draftRes, bookRes] = await Promise.all([
        API.get(`/blogs/user/${user.id}`),
        API.get(`/blogs/user/${user.id}?drafts=true`),
        API.get('/users/bookmarks'),
      ])
      setBlogs(pubRes.data.blogs)
      setDrafts(draftRes.data.blogs)
      setBookmarks(bookRes.data.bookmarks)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (blogId) => {
    if (!window.confirm('Delete this blog?')) return
    try {
      await API.delete(`/blogs/${blogId}`)
      setBlogs((prev) => prev.filter((b) => b._id !== blogId))
      setDrafts((prev) => prev.filter((b) => b._id !== blogId))
      toast.success('Blog deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <Loading />

  const tabs = [
    { key: 'published', label: 'Published', count: blogs.length },
    { key: 'drafts', label: 'Drafts', count: drafts.length },
    { key: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
  ]

  const currentBlogs = tab === 'published' ? blogs : tab === 'drafts' ? drafts : bookmarks

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/write" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
          + New Blog
        </Link>
      </div>

      <div className="flex gap-4 mb-8 border-b dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 text-sm font-medium transition ${
              tab === t.key
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {currentBlogs.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Nothing here yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBlogs.map((blog) => (
            <div key={blog._id} className="relative">
              <BlogCard blog={blog} />
              {tab !== 'bookmarks' && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Link to={`/edit/${blog._id}`} className="bg-white dark:bg-gray-700 text-sm px-3 py-1 rounded-full shadow hover:shadow-md transition">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded-full shadow hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
