import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { HiHeart, HiBookmark, HiEye } from 'react-icons/hi'

export default function BlogDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [blog, setBlog] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyText, setReplyText] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlog()
    fetchComments()
  }, [id])

  const fetchBlog = async () => {
    try {
      const { data } = await API.get(`/blogs/${id}`)
      setBlog(data.blog)
    } catch (error) {
      toast.error('Blog not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments/${id}`)
      setComments(data.comments)
    } catch (error) {
      console.error('Error fetching comments')
    }
  }

  const handleLike = async () => {
    if (!user) return toast.error('Please login first')
    try {
      const { data } = await API.put(`/blogs/${id}/like`)
      setBlog((prev) => ({
        ...prev,
        likes: data.liked
          ? [...prev.likes, user.id]
          : prev.likes.filter((l) => l !== user.id),
      }))
    } catch (error) {
      toast.error('Failed to like')
    }
  }

  const handleBookmark = async () => {
    if (!user) return toast.error('Please login first')
    try {
      const { data } = await API.put(`/users/bookmark/${id}`)
      toast.success(data.message)
    } catch (error) {
      toast.error('Failed to bookmark')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Please login first')
    if (!commentText.trim()) return
    try {
      const { data } = await API.post(`/comments/${id}`, { text: commentText })
      setComments((prev) => [data.comment, ...prev])
      setCommentText('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleReply = async (commentId) => {
    if (!user) return toast.error('Please login first')
    if (!replyText[commentId]?.trim()) return
    try {
      const { data } = await API.post(`/comments/reply/${commentId}`, { text: replyText[commentId] })
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? data.comment : c))
      )
      setReplyText((prev) => ({ ...prev, [commentId]: '' }))
      setReplyingTo(null)
      toast.success('Reply added')
    } catch (error) {
      toast.error('Failed to reply')
    }
  }

  if (loading) return <Loading />
  if (!blog) return <p className="text-center py-10">Blog not found</p>

  return (
    <article className="max-w-4xl mx-auto">
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} className="w-full h-72 object-cover rounded-2xl mb-8" />
      )}
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

      <div className="flex items-center gap-4 mb-8">
        <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3">
          <img src={blog.author?.profileImage} alt={blog.author?.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-medium">{blog.author?.name}</p>
            <p className="text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6 mb-8 pb-6 border-b dark:border-gray-700">
        <button onClick={handleLike} className="flex items-center gap-2 hover:text-red-500 transition">
          <HiHeart className={blog.likes?.includes(user?.id) ? 'text-red-500' : ''} />
          {blog.likes?.length || 0}
        </button>
        <button onClick={handleBookmark} className="flex items-center gap-2 hover:text-yellow-500 transition">
          <HiBookmark /> Bookmark
        </button>
        <span className="flex items-center gap-2 text-gray-500">
          <HiEye /> {blog.viewCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {blog.tags?.map((tag) => (
          <span key={tag} className="text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <div
        className="prose dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <section className="border-t dark:border-gray-700 pt-8">
        <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

        {user && (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
            />
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              Post Comment
            </button>
          </form>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <img src={comment.user?.profileImage} alt="" className="w-8 h-8 rounded-full" />
                <span className="font-medium text-sm">{comment.user?.name}</span>
                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mb-3">{comment.text}</p>

              {user && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reply
                </button>
              )}

              {replyingTo === comment._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyText[comment._id] || ''}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none"
                  />
                  <button
                    onClick={() => handleReply(comment._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
                  >
                    Reply
                  </button>
                </div>
              )}

              {comment.replies?.length > 0 && (
                <div className="mt-3 ml-6 space-y-3 border-l-2 dark:border-gray-600 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="text-sm">
                      <span className="font-medium">{reply.user?.name}</span>
                      <p className="text-gray-600 dark:text-gray-300">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
