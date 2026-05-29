import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Calendar } from "lucide-react";
import API from "../api/axios";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80 }
  }
};

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/achievements");
        setAchievements(res.data);
      } catch (err) {
        console.error("Failed to load achievements", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 w-full">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 relative overflow-hidden rounded-3xl glass border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <Medal className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] mb-2" />
        <h1 className="text-5xl md:text-7xl font-heading text-white font-extrabold tracking-tight relative z-10 drop-shadow-md">
          Hall of Fame
        </h1>
        <p className="text-xl md:text-2xl text-text-muted max-w-2xl font-light relative z-10 px-4">
          Celebrating the finest moments and grandest achievements of ACIK Athletics.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-6 glass rounded-3xl p-6 border border-white/5">
              <Skeleton className="w-full h-72 md:h-96 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-4 w-full">
                <Skeleton className="w-24 h-6 rounded-full" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <EmptyState 
          icon={Medal}
          title="No achievements yet"
          description="Check back later for historic moments and records."
        />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8 w-full max-w-5xl mx-auto"
        >
          {achievements.map((item) => (
            <motion.div 
              key={item.id} 
              variants={itemVariants} 
              className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-elevated border-4 md:border-[8px] border-surface shadow-2xl ring-1 ring-primary/20 hover:ring-primary/40 transition-all duration-700"
            >
              {/* Inner Plaque Border */}
              <div className="absolute inset-0 border border-primary/10 rounded-lg pointer-events-none z-20" />
              
              {/* Image Section - Spans Horizontally */}
              <div className="relative overflow-hidden w-full bg-black/40 border-b-2 border-primary/20">
                <img 
                  src={item.file_url} 
                  alt={item.caption} 
                  className="w-full h-auto max-h-[600px] object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                {/* Image Overlay for dramatic effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Content Section - Below Image */}
              <div className="flex flex-col items-center text-center p-8 md:p-12 relative overflow-hidden">
                {/* Decorative background icon */}
                <Medal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-primary/5 blur-[2px] pointer-events-none" />
                
                {/* Decorative blob for warm lighting */}
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl flex flex-col items-center">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-primary/40" />
                    <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
                      {item.tournament}
                    </span>
                    <div className="h-px w-12 bg-primary/40" />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-heading font-medium text-white leading-relaxed mb-8 max-w-2xl drop-shadow-sm">
                    "{item.caption}"
                  </h3>
                  
                  <div className="flex items-center gap-2 text-text-muted text-xs font-medium uppercase tracking-widest">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
