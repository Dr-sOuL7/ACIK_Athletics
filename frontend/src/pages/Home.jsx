import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Megaphone, FileDown, X, Calendar } from "lucide-react";
import API from "../api/axios";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
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

  // Modals state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [homepageRes, announcementRes] = await Promise.all([
          API.get("/homepage").catch(() => ({ data: { title: "ACIK Athletics", subtitle: "Athletics Club of IISER Kolkata", announcement: "Welcome" }})),
          API.get("/announcements").catch(() => ({ data: [] }))
        ]);
        
        setContent(homepageRes.data);
        setAnnouncements(announcementRes.data); // Keep all announcements
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (selectedAnnouncement || showAllAnnouncements) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedAnnouncement, showAllAnnouncements]);

  const previewAnnouncements = announcements.slice(0, 3);

  const renderAttachments = (item, isModal = false) => {
    const itemAttachments = item.attachments || [];
    if (item.file_url && itemAttachments.length === 0) {
      itemAttachments.push({ url: item.file_url, name: item.file_name || "Attachment" });
    }
    if (itemAttachments.length === 0) return null;

    const images = itemAttachments.filter(att => att.name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || att.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i));
    const docs = itemAttachments.filter(att => !(att.name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || att.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)));

    return (
      <div className={`mt-4 space-y-2 ${!isModal && 'opacity-80 hover:opacity-100 transition-opacity'}`}>
        {images.length > 0 && (
          <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {images.map((img, idx) => (
              <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className={`w-full ${isModal ? 'max-h-96' : 'h-32'} object-cover rounded-lg border border-white/5 hover:opacity-90 transition-opacity`}
                />
              </a>
            ))}
          </div>
        )}
        {docs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {docs.map((doc, idx) => (
              <a 
                key={idx}
                href={doc.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium text-sm transition-colors bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
                onClick={(e) => e.stopPropagation()}
              >
                <FileDown className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{doc.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-16 pb-16 w-full max-w-full">
      
      {/* Dynamic Branding Banner */}
      {!loading && (content?.banner_url || content?.logo_url) && (
        <section className="relative w-full h-[35vh] min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12 -mt-4 flex items-center justify-center">
          {content.banner_url ? (
            <img 
              src={content.banner_url} 
              alt="Homepage Banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
          )}
          
          {/* Subtle overlay to ensure the logo pops */}
          <div className="absolute inset-0 bg-black/20" />

          {content.logo_url && (
            <div className="relative z-10 flex items-center justify-center">
              <div className="h-36 w-36 md:h-52 md:w-52 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-transform duration-500 p-4">
                <img src={content.logo_url} alt="Homepage Logo" className="w-full h-full object-contain drop-shadow-lg" />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Cinematic Hero Section */}
      <section className={`relative w-full h-[40vh] min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 ${(!content?.banner_url && !content?.logo_url) ? '-mt-4' : ''}`}>
        <div className="absolute inset-0 bg-background">
          <img 
            src={heroImg} 
            alt="Track at night" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8 md:px-16 w-full mx-auto">
          {loading ? (
            <div className="space-y-4 flex flex-col items-center">
              <Skeleton className="w-3/4 max-w-2xl h-16 md:h-24 rounded-xl" />
              <Skeleton className="w-1/2 max-w-md h-8 rounded-lg" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {!content?.logo_url && (
                <img src="/acik-logo.png" alt="ACIK Logo" className="h-28 md:h-40 mb-8 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-white font-heading tracking-wider mb-4 leading-tight drop-shadow-xl uppercase">
                {content?.title || "ACIK Athletics"}
              </h1>
              <p className="text-lg md:text-2xl text-primary max-w-2xl mx-auto font-medium leading-relaxed tracking-widest uppercase text-opacity-90">
                {content?.subtitle || "Athletics Club of IISER Kolkata"}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="w-full">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            ANNOUNCEMENTS
          </h2>
          {announcements.length > 1 && (
            <button 
              onClick={() => setShowAllAnnouncements(true)} 
              className="text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors bg-primary/10 px-4 py-2 rounded-lg"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
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
        ) : previewAnnouncements.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {previewAnnouncements.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card 
                  hover 
                  className="h-full flex flex-col group cursor-pointer border-white/5 hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/10"
                  onClick={() => setSelectedAnnouncement(item)}
                >
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <p className="text-text-muted mb-4 flex-grow line-clamp-3">
                    {item.message}
                  </p>
                  
                  {renderAttachments(item, false)}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs font-medium text-surface-hover bg-surface-elevated w-fit px-3 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Read more</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            icon={Megaphone}
            title="No announcements"
            description="Check back later for the latest news and updates."
          />
        )}
      </section>

      {/* About Us Section */}
      <section className="w-full">
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">About Us</h2>
          <div className="space-y-4 text-lg text-text-muted leading-relaxed">
            <p>The ACIK – Athletics Club of IISER Kolkata is the official track and field club of the Indian Institute of Science Education and Research Kolkata, established in 2006. The club brings together students with a shared passion for athletics, fostering both competitive excellence and a culture of fitness and discipline.</p>
            <p>ACIK actively engages in a wide range of track and field events, including sprints (100m, 200m, 400m), middle and long-distance races (800m to 10000m), as well as field events such as shot put, discus throw, javelin throw, long jump, triple jump, and relays. The club provides a platform for athletes of all levels—from beginners to experienced competitors—to train, improve, and perform.</p>
            <p>We proudly represent IISER Kolkata in major competitions such as <strong className="text-white">Pratap (Inter-College Athletics Meet)</strong>, <strong className="text-white">Open Athletics Meets</strong>, and <strong className="text-white">IISM (Inter IISER-NISER-CEBS Sports Meet)</strong>. Alongside these, we organize internal competitions like <strong className="text-white">Inter-Batch Meets</strong>, encouraging participation and healthy competition within the campus.</p>
            <p>Beyond competition, ACIK is committed to building a strong athletic community—promoting teamwork, resilience, and the spirit of pushing limits. Whether aiming for podium finishes or personal fitness goals, the club welcomes everyone to be a part of the journey.</p>
          </div>
        </div>
      </section>

      {/* Single Announcement Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-full flex flex-col glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/95"
            >
              <div className="p-6 md:p-8 border-b border-white/5 relative shrink-0 flex justify-between items-start gap-4 bg-surface-elevated/50">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-heading font-black text-white">
                    {selectedAnnouncement.title}
                  </h2>
                  <div className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-text-main leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.message}
                  </p>
                </div>
                
                <div className="mt-8">
                  {renderAttachments(selectedAnnouncement, true)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Announcements Modal */}
      <AnimatePresence>
        {showAllAnnouncements && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllAnnouncements(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[90vh] flex flex-col glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-surface/95"
            >
              <div className="p-6 md:p-8 border-b border-white/5 relative shrink-0 flex justify-between items-center bg-surface-elevated/50">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-heading font-black text-white">
                    All Announcements
                  </h2>
                </div>
                <button
                  onClick={() => setShowAllAnnouncements(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-surface-elevated rounded-2xl border border-white/5 p-6 shadow-md">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <div className="text-sm font-medium text-text-muted flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <p className="text-text-main whitespace-pre-wrap leading-relaxed">{item.message}</p>
                    {renderAttachments(item, true)}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}