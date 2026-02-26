import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WriteBlog from './pages/WriteBlog';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Search from './pages/Search';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<Search />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write"
            element={
              <ProtectedRoute>
                <WriteBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write/:id"
            element={
              <ProtectedRoute>
                <WriteBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xl mb-6">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
