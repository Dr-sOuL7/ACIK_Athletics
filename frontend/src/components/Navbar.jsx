import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, Shield, Trophy, Megaphone, Calendar } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./ui/Button";
import { AuthContext } from "../context/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, role, logout } = useContext(AuthContext);
  
  const isAdmin = role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const links = [
    { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Results", path: "/results", icon: Trophy },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Rankings", path: "/rankings", icon: Trophy },
    { name: "Announcements", path: "/announcements", icon: Megaphone },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex flex-col">
          <h1 className="font-heading text-primary text-3xl font-extrabold tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            ACIK
          </h1>
          <p className="text-xs text-text-muted font-medium tracking-wide uppercase">
            Athletics Club
          </p>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-text-main p-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-1 items-center">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-text-muted"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Auth / Admin Buttons */}
        <div className="hidden md:flex gap-3 items-center">
          {!token ? (
            <Link to="/login">
              <Button variant="primary">Login</Button>
            </Link>
          ) : (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="surface" className="gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="danger" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-surface overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                      isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-main"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="h-px bg-white/5 my-2" />
              
              {!token ? (
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full">Login</Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      <Button variant="surface" className="w-full gap-2 justify-center">
                        <Shield className="w-4 h-4 text-secondary" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="danger" onClick={handleLogout} className="w-full gap-2 justify-center">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}