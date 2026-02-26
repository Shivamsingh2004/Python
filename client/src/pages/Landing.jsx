import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import BlogCard from '../components/BlogCard';

const POPULAR_TAGS = ['javascript', 'react', 'python', 'webdev', 'career', 'ai', 'opensource'];

const Landing = () => {
  const [blogs, setBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (activeTag) params.tag = activeTag;
        const [blogsRes, trendingRes] = await Promise.all([
          api.get('/blogs', { params }),
          api.get('/blogs/trending'),
        ]);
        setBlogs(blogsRes.data.blogs);
        setPagination(blogsRes.data.pagination);
        setTrending(trendingRes.data.blogs);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, activeTag]);

  const handleTagFilter = (tag) => {
    if (activeTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center py-16 mb-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Where ideas come to life
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
          Read, write, and share stories that matter. Join thousands of writers on Blogify.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup" className="btn-primary text-base px-6 py-3">
            Start Writing
          </Link>
          <Link to="/" className="btn-secondary text-base px-6 py-3">
            Explore Blogs
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setSearchParams({}); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeTag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-xl mb-2">No blogs found</p>
              <p>Be the first to write about this topic!</p>
              <Link to="/write" className="btn-primary mt-4 inline-block">Write a Blog</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Trending */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
              <span>🔥</span> Trending
            </h3>
            {trending.slice(0, 5).map((blog, i) => (
              <Link key={blog._id} to={`/blog/${blog.slug}`} className="flex gap-3 mb-4 group">
                <span className="text-2xl font-bold text-gray-200 dark:text-gray-700 select-none w-6">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                    {blog.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {blog.authorId?.name} · {blog.viewCount} views
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Popular Tags */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h3 className="font-bold text-lg mb-2">Share your story</h3>
            <p className="text-blue-100 text-sm mb-4">
              Join thousands of writers sharing ideas, stories, and expertise.
            </p>
            <Link to="/signup" className="block text-center bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Get Started – Free
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Landing;
