import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import API from '../api/axios'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'

export default function Landing() {
  const [blogs, setBlogs] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    fetchBlogs()
    if (!searchQuery) fetchTrending()
  }, [page, searchQuery])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const endpoint = searchQuery
        ? `/blogs/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
        : `/blogs?page=${page}`
      const { data } = await API.get(endpoint)
      setBlogs(data.blogs)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      const { data } = await API.get('/blogs/trending')
      setTrending(data.blogs)
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      {!searchQuery && trending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔥 Trending
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.slice(0, 3).map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery ? `Results for "${searchQuery}"` : '📝 Latest Posts'}
        </h2>
        {blogs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No blogs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  page === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
