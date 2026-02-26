import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', bio: '', profileImage: '' })

  const isOwner = currentUser?.id === id

  useEffect(() => {
    fetchProfile()
    fetchBlogs()
  }, [id])

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/users/${id}`)
      setProfile(data.user)
      setEditData({ name: data.user.name, bio: data.user.bio || '', profileImage: data.user.profileImage })
    } catch (error) {
      toast.error('Profile not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogs = async () => {
    try {
      const { data } = await API.get(`/blogs/user/${id}`)
      setBlogs(data.blogs)
    } catch (error) {
      console.error('Error fetching blogs')
    }
  }

  const handleFollow = async () => {
    if (!currentUser) return toast.error('Please login first')
    try {
      const { data } = await API.put(`/users/follow/${id}`)
      toast.success(data.message)
      fetchProfile()
    } catch (error) {
      toast.error('Failed')
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { data } = await API.put('/users/profile', editData)
      setProfile((prev) => ({ ...prev, ...data.user }))
      updateUser({ ...currentUser, name: data.user.name, profileImage: data.user.profileImage })
      setEditing(false)
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  if (loading) return <Loading />
  if (!profile) return <p className="text-center py-10">Profile not found</p>

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img src={profile.profileImage} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
          <div className="text-center md:text-left flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write a short bio..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none"
                />
                <input
                  type="url"
                  value={editData.profileImage}
                  onChange={(e) => setEditData((prev) => ({ ...prev, profileImage: e.target.value }))}
                  placeholder="Profile image URL"
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(false)} className="border px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.bio && <p className="text-gray-500 mt-1">{profile.bio}</p>}
                <div className="flex gap-6 mt-3 justify-center md:justify-start">
                  <span><strong>{profile.followersCount}</strong> Followers</span>
                  <span><strong>{profile.followingCount}</strong> Following</span>
                  <span><strong>{profile.postsCount}</strong> Posts</span>
                </div>
                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                  {isOwner ? (
                    <button onClick={() => setEditing(true)} className="border dark:border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Edit Profile
                    </button>
                  ) : (
                    <button onClick={handleFollow} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                      Follow / Unfollow
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Published Blogs</h2>
      {blogs.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No blogs published yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}
