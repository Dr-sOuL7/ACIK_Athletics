import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Megaphone, Image as ImageIcon, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

import heroImg from "../assets/hero.png"; // We'll move the generated image here

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Home() {
  const [content, setContent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [homepageRes, announcementRes] = await Promise.all([
          API.get("/homepage").catch(() => ({ data: { title: "ACIK Athletics", subtitle: "Athletics Club of IISER Kolkata", announcement: "Welcome" }})),
          API.get("/announcements").catch(() => ({ data: [] }))
        ]);
        
        setContent(homepageRes.data);
        setAnnouncements(announcementRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col space-y-16 pb-16 w-full max-w-full">
      
      {/* Cinematic Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] rounded-3xl overflow-hidden -mt-4 shadow-2xl">
        <div className="absolute inset-0 bg-background">
          <img 
            src={heroImg} 
            alt="Track at night" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="w-3/4 h-16 md:h-24 rounded-xl" />
              <Skeleton className="w-1/2 h-8 rounded-lg" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white font-heading tracking-tight mb-6 leading-tight drop-shadow-lg">
                {content?.title || "ACIK Athletics"}
              </h1>
              <p className="text-xl md:text-3xl text-text-muted max-w-2xl font-light mb-10 leading-relaxed">
                {content?.subtitle || "Athletics Club of IISER Kolkata"}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/gallery">
                  <Button size="lg" className="gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    View Gallery <ImageIcon className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/records">
                  <Button variant="surface" size="lg" className="gap-2">
                    All-Time Records <Trophy className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Announcement Banner */}
      {!loading && content?.announcement && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <div className="glass p-8 rounded-2xl border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Megaphone className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                </span>
                <h2 className="text-2xl font-bold font-heading text-secondary">Bulletin</h2>
              </div>
              <p className="text-xl text-text-main leading-relaxed mb-4">
                {content.announcement}
              </p>
              {content.file_url && (
                <div className="mt-4">
                  {content.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || content.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img 
                      src={content.file_url} 
                      alt={content.file_name || "Attachment"} 
                      className="max-h-64 rounded-xl object-contain border border-white/10"
                    />
                  ) : (
                    <a 
                      href={content.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-xl text-secondary transition-colors font-medium text-sm w-fit"
                    >
                      <FileDown className="w-4 h-4" />
                      {content.file_name || "Download Attachment"}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Latest Updates Grid */}
      <section className="w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Latest Updates</h2>
          <Link to="/announcements" className="text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48">
                <Skeleton className="w-2/3 h-6 mb-4" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-1/2 h-4 mt-6" />
              </Card>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {announcements.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card hover className="h-full flex flex-col group">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <p className="text-text-muted mb-4 flex-grow line-clamp-3">
                    {item.message}
                  </p>
                  {item.file_url && (
                    <div className="mb-4">
                      {item.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || item.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <img 
                            src={item.file_url} 
                            alt={item.file_name || "Attachment"} 
                            className="w-full h-32 object-cover rounded-lg border border-white/5 hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : (
                        <a 
                          href={item.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileDown className="w-4 h-4" />
                          {item.file_name || "Attachment"}
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-xs font-medium text-surface-hover bg-surface-elevated w-fit px-3 py-1 rounded-full mt-auto">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            icon={Megaphone}
            title="No recent updates"
            description="Check back later for the latest news and announcements."
          />
        )}
      </section>
    </div>
  );
}