import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { HiMenu, HiX, HiSun, HiMoon, HiSearch } from 'react-icons/hi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          BlogVerse
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 flex-1 max-w-md mx-6">
          <HiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm dark:text-gray-200"
          />
        </form>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle theme">
            {dark ? <HiSun className="text-xl text-yellow-400" /> : <HiMoon className="text-xl" />}
          </button>
          {user ? (
            <>
              <Link to="/write" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-700 transition">
                Write
              </Link>
              <Link to="/dashboard" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Admin
                </Link>
              )}
              <Link to={`/profile/${user.id}`}>
                <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              </Link>
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Login
              </Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-700 transition">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" aria-label="Toggle menu">
          {menuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-white dark:bg-gray-800">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
            <HiSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm dark:text-gray-200"
            />
          </form>
          {user ? (
            <>
              <Link to="/write" onClick={() => setMenuOpen(false)} className="block text-sm py-2">Write</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm py-2">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm py-2">Admin</Link>
              )}
              <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="block text-sm py-2">Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-sm text-red-500 py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm py-2">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block text-sm py-2">Sign Up</Link>
            </>
          )}
          <button onClick={toggleTheme} className="flex items-center gap-2 text-sm py-2">
            {dark ? <HiSun className="text-yellow-400" /> : <HiMoon />} {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}
    </nav>
  )
}
