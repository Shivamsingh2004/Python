import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const [blogRes, commentsRes] = await Promise.all([
          api.get(`/blogs/${slug}`),
          api.get(`/comments/${slug}`).catch(() => ({ data: { comments: [] } })),
        ]);
        setBlog(blogRes.data.blog);
        setLikesCount(blogRes.data.blog.likes?.length || 0);
        setLiked(user && blogRes.data.blog.likes?.includes(user._id));

        const blogId = blogRes.data.blog._id;
        const cRes = await api.get(`/comments/${blogId}`);
        setComments(cRes.data.comments);

        if (user) {
          const userRes = await api.get(`/users/${user._id}`);
          setBookmarked(userRes.data.user.bookmarks?.some((b) =>
            typeof b === 'string' ? b === blogId : b._id === blogId
          ) || false);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, user]);

  // Socket.io for realtime comments
  useEffect(() => {
    if (!blog) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('join_blog', blog._id);

    socket.on('new_comment', (comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    socket.on('new_reply', ({ commentId, reply }) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c
        )
      );
    });

    return () => {
      socket.emit('leave_blog', blog._id);
      socket.disconnect();
    };
  }, [blog]);

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await api.put(`/blogs/${blog._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch {
      // ignore
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await api.put(`/users/bookmark/${blog._id}`);
      setBookmarked(res.data.bookmarked);
    } catch {
      // ignore
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    setSubmitting(true);
    try {
      await api.post(`/comments/${blog._id}`, { text: commentText });
      setCommentText('');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim() || !isAuthenticated) return;
    try {
      await api.post(`/comments/${commentId}/reply`, { text: replyText });
      setReplyText('');
      setReplyingTo(null);
    } catch {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <p className="text-xl">Blog not found</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const author = blog.authorId;
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
        />
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {blog.tags?.map((tag) => (
          <Link
            key={tag}
            to={`/?tag=${tag}`}
            className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        {blog.title}
      </h1>

      {/* Author */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <Link to={`/profile/${author?._id}`} className="flex items-center gap-3 group">
          <img
            src={author?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || 'A')}&background=3b82f6&color=fff`}
            alt={author?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {author?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {date} · {blog.readTime || 1} min read
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              liked
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{likesCount}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full border transition-colors ${
              bookmarked
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-500'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div
        className="blog-content prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Comments Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              className="input-field min-h-[100px] resize-none mb-3"
              maxLength={2000}
            />
            <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary">
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-3">Sign in to join the conversation</p>
            <Link to="/login" className="btn-primary">Sign In</Link>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.userId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.name || 'U')}&background=3b82f6&color=fff&size=32`}
                      alt={comment.userId?.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.userId?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(user?._id === comment.userId?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {comment.text}
                </p>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-4 ml-6 space-y-3">
                    {comment.replies.map((reply, ri) => (
                      <div key={ri} className="flex items-start gap-2">
                        <img
                          src={reply.userId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userId?.name || 'U')}&background=6366f1&color=fff&size=24`}
                          alt={reply.userId?.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex-1">
                          <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{reply.userId?.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {isAuthenticated && (
                  <div className="mt-3">
                    {replyingTo === comment._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="input-field text-sm flex-1"
                          maxLength={1000}
                        />
                        <button onClick={() => handleReply(comment._id)} className="btn-primary text-xs px-3">
                          Reply
                        </button>
                        <button onClick={() => setReplyingTo(null)} className="btn-secondary text-xs px-3">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
