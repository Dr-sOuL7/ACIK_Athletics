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
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="break-inside-avoid">
              <Skeleton className="w-full h-64 rounded-3xl" />
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
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {achievements.map((item) => (
            <motion.div key={item.id} variants={itemVariants} className="break-inside-avoid group relative rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500">
              
              <div className="relative overflow-hidden w-full h-auto max-h-[600px]">
                <img 
                  src={item.file_url} 
                  alt={item.caption} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-3 w-fit backdrop-blur-md shadow-lg">
                  {item.tournament}
                </span>
                
                <h3 className="text-xl md:text-2xl font-bold text-white leading-snug drop-shadow-lg">
                  {item.caption}
                </h3>
                
                <div className="flex items-center gap-2 mt-4 text-white/60 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
