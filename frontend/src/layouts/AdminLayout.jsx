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
        onClick={() =>
          setOpen(!open)
        }

        className="
          md:hidden
          fixed
          top-4
          left-4
          z-50
          bg-yellow-400
          text-black
          p-2
          rounded-lg
        "
      >
        ☰
      </button>

      <aside
        className={`

          fixed
          md:static

          z-40

          top-0
          left-0

          h-full

          w-64

          bg-slate-900

          border-r
          border-slate-700

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

        <h2
          className="
            text-2xl
            text-yellow-400
            font-bold
            mb-8
          "
        >
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4">

          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/admin/homepage">
            Homepage
          </Link>

          <Link to="/admin/events">
            Events
          </Link>

          <Link to="/admin/rankings">
            Rankings
          </Link>

          <Link to="/admin/records">
            All-Time Records
          </Link>

        </nav>

      </aside>

      <main
        className="
          flex-1
          p-6
          md:ml-0
          bg-slate-950
          text-white
        "
      >

        {children}

      </main>

    </div>
  );
}