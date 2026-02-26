import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, blogsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/blogs'),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setBlogs(blogsRes.data.blogs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBlockUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u))
      );
    } catch {
      alert('Failed to update user status');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await api.delete(`/admin/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch {
      alert('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage platform content and users</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
            { label: 'Total Blogs', value: stats.totalBlogs, icon: '📝', color: 'green' },
            { label: 'Published', value: stats.publishedBlogs, icon: '✅', color: 'emerald' },
            { label: 'Comments', value: stats.totalComments, icon: '💬', color: 'purple' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
                    {value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-6">
          {['stats', 'users', 'blogs'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'stats' ? 'Overview' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32&background=3b82f6&color=fff`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isBlocked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleBlockUser(u._id)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          u.isBlocked
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                        }`}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blogs Tab */}
      {tab === 'blogs' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Views</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Created</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {blog.authorId?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      blog.published
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{blog.viewCount}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="text-xs px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Content Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Blogs', value: stats.totalBlogs },
                { label: 'Published Blogs', value: stats.publishedBlogs },
                { label: 'Drafts', value: stats.totalBlogs - stats.publishedBlogs },
                { label: 'Total Comments', value: stats.totalComments },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Active Users', value: users.filter((u) => !u.isBlocked).length },
                { label: 'Blocked Users', value: users.filter((u) => u.isBlocked).length },
                { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
