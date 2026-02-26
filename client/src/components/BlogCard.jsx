import { Link } from 'react-router-dom'
import { HiHeart, HiEye } from 'react-icons/hi'

export default function BlogCard({ blog }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      {blog.coverImage && (
        <Link to={`/blog/${blog._id}`}>
          <img src={blog.coverImage} alt={blog.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <img
            src={blog.author?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={blog.author?.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <Link to={`/profile/${blog.author?._id}`} className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
              {blog.author?.name}
            </Link>
            <p className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Link to={`/blog/${blog._id}`}>
          <h3 className="text-lg font-bold mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><HiHeart /> {blog.likes?.length || 0}</span>
          <span className="flex items-center gap-1"><HiEye /> {blog.viewCount || 0}</span>
        </div>
      </div>
    </div>
  )
}
