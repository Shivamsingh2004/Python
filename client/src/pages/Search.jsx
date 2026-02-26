import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import BlogCard from '../components/BlogCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    if (!searchQuery) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get('/blogs/search', {
          params: { q: searchQuery, page, limit: 10 },
        });
        setResults(res.data.blogs);
        setPagination(res.data.pagination);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      setPage(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blogs by title or tag..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {searchQuery && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          {loading
            ? 'Searching...'
            : `${pagination.total || 0} results for "${searchQuery}"`}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="space-y-4">
            {results.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">{page} / {pagination.pages}</span>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </>
      ) : searchQuery ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-xl mb-2">No results found for &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-sm">Try different keywords or tags</p>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p>Enter a search term to find blogs</p>
        </div>
      )}
    </div>
  );
};

export default Search;
