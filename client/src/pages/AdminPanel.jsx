import { useState, useEffect } from 'react'
import API from '../api/axios'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [tab, setTab] = useState('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats'),
      ])
      setUsers(usersRes.data.users)
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/block`)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: data.isBlocked } : u))
      )
      toast.success(data.message)
    } catch (error) {
      toast.error('Failed')
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="flex gap-4 mb-8 border-b dark:border-gray-700">
        {['stats', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition ${
              tab === t
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-indigo-600">{stats.totalUsers || 0}</p>
            <p className="text-gray-500 mt-1">Total Users</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-green-600">{stats.totalBlogs || 0}</p>
            <p className="text-gray-500 mt-1">Total Blogs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-purple-600">{stats.totalComments || 0}</p>
            <p className="text-gray-500 mt-1">Total Comments</p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={u.profileImage} alt="" className="w-8 h-8 rounded-full" />
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleBlock(u._id)}
                      className={`text-sm px-3 py-1 rounded-lg ${u.isBlocked ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} hover:opacity-80 transition`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
