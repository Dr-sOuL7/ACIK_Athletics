import { useState }
from "react";

import { Link }
from "react-router-dom";

import { jwtDecode }
from "jwt-decode";

export default function Navbar() {

  const [open, setOpen] =
    useState(false);

  const token =
    localStorage.getItem("token");

  let isAdmin = false;

  if (token) {

    try {

      const decoded =
        jwtDecode(token);

      isAdmin =
        decoded.role === "admin";

    } catch (err) {

      console.log(err);
    }
  }

  function logout() {

    localStorage.removeItem("token");

    window.location.href = "/";
  }

  return (

    <nav
      className="
        bg-slate-900
        border-b
        border-slate-700
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto

          px-6
          py-4

          flex
          justify-between
          items-center
        "
      >

        <div>

          <h1
            className="
              text-yellow-400
              text-2xl
              font-bold
            "
          >
            ACIK
          </h1>

          <p
            className="
              text-sm
              text-slate-400
            "
          >
            Athletics Club of IISER Kolkata
          </p>

        </div>

        <button
          onClick={() =>
            setOpen(!open)
          }

          className="
            md:hidden
            text-white
            text-3xl
          "
        >
          ☰
        </button>

        <div
          className="
            hidden
            md:flex
            gap-6
            items-center
          "
        >

          <Link to="/">
            Home
          </Link>

          <Link to="/results">
            Results
          </Link>

          <Link to="/events">
            Events
          </Link>

          <Link to="/rankings">
            Rankings
          </Link>

          <Link to="/announcements">
            Announcements
          </Link>

          {!token && (

            <Link to="/login">
              Login
            </Link>

          )}

          {isAdmin && (

            <Link to="/admin">
              Admin
            </Link>

          )}

          {token && (

            <button
              onClick={logout}

              className="
                bg-red-600
                px-4
                py-2
                rounded-lg
              "
            >
              Logout
            </button>

          )}

        </div>

      </div>

      {open && (

        <div
          className="
            md:hidden

            flex
            flex-col

            gap-4

            px-6
            pb-6
          "
        >

          <Link to="/">
            Home
          </Link>

          <Link to="/results">
            Results
          </Link>

          <Link to="/events">
            Events
          </Link>

          <Link to="/rankings">
            Rankings
          </Link>

          <Link to="/announcements">
            Announcements
          </Link>

          {!token && (

            <Link to="/login">
              Login
            </Link>

          )}

          {isAdmin && (

            <Link to="/admin">
              Admin
            </Link>

          )}

          {token && (

            <button
              onClick={logout}

              className="
                bg-red-600
                px-4
                py-2
                rounded-lg
              "
            >
              Logout
            </button>

          )}

        </div>

      )}

    </nav>
  );
}