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
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/records" className="text-text-muted hover:text-primary transition-colors">All-Time Records</Link></li>
              <li><Link to="/announcements" className="text-text-muted hover:text-primary transition-colors">Announcements</Link></li>
              <li><Link to="/gallery" className="text-text-muted hover:text-primary transition-colors">Gallery</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/LAA5gcrwgeRDDJ4UA" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  IISER Kolkata Campus<br/>Mohanpur, Nadia, West Bengal 741246
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=athletics.activity@iiserkol.ac.in" target="_blank" rel="noopener noreferrer" aria-label="Email athletics.activity@iiserkol.ac.in via Gmail" className="hover:text-white transition-colors">athletics.activity@iiserkol.ac.in</a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                <a href="https://www.instagram.com/athletics.iiserk?igsh=YTYwa3ZzZWI2bWdk" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram Profile" className="hover:text-white transition-colors">athletics.iiserk</a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                <a href="https://youtube.com/@athleticsclubofiiserkolkata?si=IKw-QpAdIBDCu0R9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@AthleticsClubofIISERKolkata</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img src="/iiser-logo.png" alt="IISER Kolkata Logo" className="h-10 md:h-12 object-contain opacity-80 hover:opacity-100 transition-opacity drop-shadow-lg" />
            <p>© {new Date().getFullYear()} Athletics Club of IISER Kolkata. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
