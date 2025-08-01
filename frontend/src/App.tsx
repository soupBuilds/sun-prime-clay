import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation bar ─────────────────────────────── */}
      <nav className="bg-gray-900 text-white p-4 flex gap-6">
        <Link to="/"   className="hover:text-blue-400">Home</Link>
        <Link to="/po" className="hover:text-blue-400">Purchase Orders</Link>
        {/* add more links later: /maintenance, /qc, /hr, … */}
      </nav>

      {/* ─── Routed pages render here ───────────────────── */}
      <main className="flex-1 p-6">
        <Outlet />  {/* React-Router will inject the matched page */}
      </main>
    </div>
  )
}
