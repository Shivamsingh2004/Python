import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const author = blog.authorId;
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            author?.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || 'A')}&background=3b82f6&color=fff`
          }
          alt={author?.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <Link
            to={`/profile/${author?._id}`}
            className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {author?.name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link to={`/blog/${blog.slug}`}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-1 transition-colors">
              {blog.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {blog.content.replace(/<[^>]*>|</g, '').slice(0, 150)}...
          </p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap gap-1">
              {blog.tags?.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${tag}`}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {blog.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {blog.commentCount || 0}
              </span>
              <span>{blog.readTime || 1} min read</span>
            </div>
          </div>
        </div>

        {blog.coverImage && (
          <div className="flex-shrink-0">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
