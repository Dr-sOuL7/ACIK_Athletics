import { useState }
from "react";

import { Link }
from "react-router-dom";

export default function AdminLayout({

  children,

}) {

  const [open, setOpen] =
    useState(false);

  return (

    <div className="min-h-screen flex">

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-surface-elevated text-white p-2 rounded-lg border border-white/10 hover:bg-surface-hover transition-colors"
        aria-label="Toggle admin menu"
      >
        ☰
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`

          fixed
          md:static

          z-40

          top-0
          left-0

          h-full
          w-64
          bg-surface
          border-r
          border-white/5
          p-6

          transform

          transition-transform

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        <h2 className="text-2xl text-white font-heading font-bold mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4">

          <Link to="/admin" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Dashboard</Link>
          <Link to="/admin/homepage" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Home</Link>
          <Link to="/admin/results" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Results</Link>
          <Link to="/admin/events" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Events</Link>
          <Link to="/admin/records" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Records</Link>
          <Link to="/admin/rankings" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Rankings</Link>
          <Link to="/admin/announcements" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Announcements</Link>
          <Link to="/admin/gallery" onClick={() => setOpen(false)} className="text-text-muted hover:text-white transition-colors">Gallery</Link>

        </nav>

      </aside>

      <main className="flex-1 p-6 md:p-10 md:ml-0 bg-background text-text-main min-h-screen">

        {children}

      </main>

    </div>
  );
}