export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} BlogVerse. Built with MERN Stack.</p>
        <p className="mt-1">A Final Year B.Tech Project</p>
      </div>
    </footer>
  )
}
