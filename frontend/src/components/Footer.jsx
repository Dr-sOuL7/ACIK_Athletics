import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <h2 className="font-heading text-primary text-2xl font-bold tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                ACIK
              </h2>
              <p className="text-xs text-text-muted font-medium tracking-wide uppercase">
                Athletics Club
              </p>
            </Link>
            <p className="text-sm text-text-muted max-w-sm">
              The official Athletics Club of IISER Kolkata. Dedicated to excellence in track and field, fostering sportsmanship, and building champions.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="text-text-muted hover:text-primary transition-colors">Upcoming Events</Link></li>
              <li><Link to="/results" className="text-text-muted hover:text-primary transition-colors">Latest Results</Link></li>
              <li><Link to="/all-time-records" className="text-text-muted hover:text-primary transition-colors">All-Time Records</Link></li>
              <li><Link to="/rankings" className="text-text-muted hover:text-primary transition-colors">Athlete Rankings</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>IISER Kolkata Campus<br/>Mohanpur, Nadia, West Bengal 741246</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <a href="mailto:sports@iiserkol.ac.in" aria-label="Email sports@iiserkol.ac.in" className="hover:text-white transition-colors">sports@iiserkol.ac.in</a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                <a href="#" aria-label="Visit our Instagram Profile" className="hover:text-white transition-colors">@iiserk_sports</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Athletics Club of IISER Kolkata. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
