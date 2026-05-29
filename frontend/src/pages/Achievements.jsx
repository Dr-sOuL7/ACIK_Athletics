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
            <div key={i} className="flex flex-col md:flex-row gap-6 glass rounded-3xl p-4 border border-white/5">
              <Skeleton className="w-full md:w-2/5 h-64 md:h-72 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-4 w-full justify-center p-4">
                <Skeleton className="w-24 h-6 rounded-full" />
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-3/4 h-12 rounded-xl" />
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
              className="group flex flex-col md:flex-row rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl hover:shadow-xl hover:border-primary/30 transition-all duration-500 bg-surface/50"
            >
              
              {/* Image Section */}
              <div className="relative overflow-hidden w-full md:w-2/5 shrink-0 bg-black/20">
                <img 
                  src={item.file_url} 
                  alt={item.caption} 
                  className="w-full h-64 md:h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out min-h-[250px]"
                  loading="lazy"
                />
              </div>
              
              {/* Content Section */}
              <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10 w-full md:w-3/5 relative">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-sm">
                    {item.tournament}
                  </span>
                  
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight mb-6">
                    {item.caption}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
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
