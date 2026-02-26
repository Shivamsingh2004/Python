import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [postCount, setPostCount] = useState(0);

  const isOwner = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, blogsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/blogs/user/${id}`),
        ]);
        setProfile(profileRes.data.user);
        setPostCount(profileRes.data.postCount);
        setBlogs(blogsRes.data.blogs);
        setEditForm({ name: profileRes.data.user.name, bio: profileRes.data.user.bio || '' });
        if (currentUser) {
          setIsFollowing(
            profileRes.data.user.followers?.some((f) =>
              typeof f === 'string' ? f === currentUser._id : f._id === currentUser._id
            ) || false
          );
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) return;
    setFollowLoading(true);
    try {
      const res = await api.put(`/users/${id}/follow`);
      setIsFollowing(res.data.following);
      setProfile((prev) => ({
        ...prev,
        followers: res.data.following
          ? [...(prev.followers || []), { _id: currentUser._id }]
          : (prev.followers || []).filter((f) => f._id !== currentUser._id),
      }));
    } catch {
      // ignore
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('bio', editForm.bio);
      if (editImage) formData.append('profileImage', editImage);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data.user);
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-xl">User not found</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className="card p-6 mb-8">
        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  editImage
                    ? URL.createObjectURL(editImage)
                    : profile.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff&size=80`
                }
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
              />
              <div>
                <label className="btn-secondary text-sm cursor-pointer">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setEditImage(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="input-field"
              placeholder="Your name"
              required
            />
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <img
              src={
                profile.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff&size=80`
              }
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                  {profile.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-lg">{profile.bio}</p>
                  )}
                </div>
                {isOwner ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                    Edit Profile
                  </button>
                ) : isAuthenticated ? (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={isFollowing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                ) : null}
              </div>

              <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  <strong className="text-gray-900 dark:text-white">{postCount}</strong> posts
                </span>
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {profile.followers?.length || 0}
                  </strong>{' '}
                  followers
                </span>
                <span>
                  <strong className="text-gray-900 dark:text-white">
                    {profile.following?.length || 0}
                  </strong>{' '}
                  following
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blogs */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {isOwner ? 'Your Posts' : `Posts by ${profile.name}`}
      </h2>
      {blogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No published posts yet.</p>
          {isOwner && (
            <Link to="/write" className="btn-primary mt-4 inline-block">
              Write your first blog
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
