import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import authBg from "../assets/auth-bg.png";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
        
        {/* Subtle Background Glow for Form Side */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <h1 className="font-heading text-primary text-3xl font-extrabold tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              ACIK
            </h1>
            <p className="text-xs text-text-muted font-medium tracking-wide uppercase">
              Athletics Club
            </p>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-2">{title}</h2>
            <p className="text-text-muted mb-8">{subtitle}</p>

            <div className="glass p-8 rounded-2xl border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-background/20 mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background z-20" />
        <motion.img 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={authBg} 
          alt="Cinematic athletics stadium" 
          className="w-full h-full object-cover"
        />
        
        {/* Floating Quote/Branding */}
        <div className="absolute bottom-12 left-12 z-30 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-2xl font-light text-white leading-relaxed mb-4">
              "Excellence is not a singular act, but a habit. You are what you repeatedly do."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-primary" />
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Pursue Greatness
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
