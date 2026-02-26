import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import BlogCard from '../components/BlogCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('published');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, bookmarksRes] = await Promise.all([
          api.get(`/blogs/user/${user._id}`),
          api.get('/users/bookmarks'),
        ]);
        setBlogs(blogsRes.data.blogs);
        setBookmarks(bookmarksRes.data.bookmarks);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const published = blogs.filter((b) => b.published);
  const drafts = blogs.filter((b) => !b.published);

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch {
      alert('Failed to delete blog');
    }
  };

  const tabBlogs = tab === 'published' ? published : tab === 'drafts' ? drafts : bookmarks;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your content</p>
        </div>
        <Link to="/write" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Blog
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Published', value: published.length, color: 'blue' },
          { label: 'Drafts', value: drafts.length, color: 'yellow' },
          { label: 'Bookmarks', value: bookmarks.length, color: 'green' },
          { label: 'Followers', value: user?.followers?.length || 0, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-6">
          {[
            { key: 'published', label: `Published (${published.length})` },
            { key: 'drafts', label: `Drafts (${drafts.length})` },
            { key: 'bookmarks', label: `Bookmarks (${bookmarks.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog List */}
      {tabBlogs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-4">
            {tab === 'bookmarks' ? 'No bookmarks yet.' : 'No blogs here yet.'}
          </p>
          {tab !== 'bookmarks' && (
            <Link to="/write" className="btn-primary">
              Write your first blog
            </Link>
          )}
        </div>
      ) : tab === 'bookmarks' ? (
        <div className="space-y-4">
          {bookmarks.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tabBlogs.map((blog) => (
            <div key={blog._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        blog.published
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors"
                  >
                    {blog.title}
                  </Link>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>👁 {blog.viewCount} views</span>
                    <span>❤️ {blog.likes?.length || 0} likes</span>
                    <span>💬 {blog.commentCount || 0} comments</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/write/${blog._id}`}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
