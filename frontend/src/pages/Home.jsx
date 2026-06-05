import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Megaphone, FileDown, X, Calendar, Copy, CheckCircle2, Users, Trophy, Medal, Image as ImageIcon, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

import heroImg from "../assets/hero.webp"; // We'll move the generated image here

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
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [homepageRes, announcementRes, teamRes] = await Promise.all([
          API.get("/homepage").catch(() => ({ data: { title: "ACIK Athletics", subtitle: "Athletics Club of IISER Kolkata", announcement: "Welcome" }})),
          API.get("/announcements").catch(() => ({ data: [] })),
          API.get("/team").catch(() => ({ data: [] }))
        ]);
        
        setContent(homepageRes.data);
        setAnnouncements(announcementRes.data);
        setTeam(teamRes.data);
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
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  className={`w-full ${isModal ? 'h-auto max-h-96 object-contain' : 'h-32 object-cover'} rounded-lg border border-white/5 hover:opacity-90 transition-opacity`}
                  style={img.width && img.height ? { aspectRatio: `${img.width} / ${img.height}` } : undefined}
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

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard!", { icon: <CheckCircle2 className="w-5 h-5 text-success" /> });
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
              width={content.banner_width}
              height={content.banner_height}
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
                <img src={content.logo_url} width={content.logo_width} height={content.logo_height} alt="Homepage Logo" className="w-full h-full object-contain drop-shadow-lg" />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Cinematic Hero Section */}
      {loading ? (
        <section className="relative w-full h-[60vh] min-h-[500px] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 -mt-4 bg-background">
          <div className="h-full flex flex-col justify-center items-center text-center px-8">
            <Skeleton className="w-3/4 max-w-2xl h-16 md:h-24 rounded-xl" />
            <Skeleton className="w-1/2 max-w-md h-8 rounded-lg mt-4" />
          </div>
        </section>
      ) : (
        <section className={`relative w-full h-[60vh] min-h-[500px] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 ${(!content?.banner_url && !content?.logo_url) ? '-mt-4' : ''}`}>
          <div className="absolute inset-0 bg-background">
            <img 
              src={content?.hero_bg_url || heroImg} 
              alt="Track at night" 
              fetchpriority="high"
              width={content?.hero_bg_width}
              height={content?.hero_bg_height}
              className="w-full h-full object-cover opacity-80"
            />
            {/* Subtle Gradient Overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8 md:px-16 w-full mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {!content?.logo_url && (
                <img src="/acik-logo.png" alt="ACIK Logo" className="h-24 md:h-32 mb-6 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
              )}
              <h1 className="text-5xl md:text-7xl font-bold text-white font-heading tracking-wider mb-6 leading-tight drop-shadow-xl uppercase whitespace-pre-wrap">
                {content?.title || "ACIK Athletics"}
              </h1>
              <p className="text-lg md:text-2xl text-primary max-w-2xl mx-auto font-medium leading-relaxed tracking-widest uppercase text-opacity-90 mb-10 whitespace-pre-wrap">
                {content?.subtitle || "Where Records Are Made. Where Legends Begin."}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Explore ACIK Section */}
      <section className="w-full">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">Explore ACIK</h2>
          <p className="text-text-muted text-lg max-w-2xl">
            Discover records, achievements, memories, and resources from the Athletics Club of IISER Kolkata.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Records */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/records" className="block group h-full">
              <div className="bg-surface-elevated rounded-3xl p-6 border border-white/5 shadow-lg hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 text-primary">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-primary transition-colors">Records</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-grow group-hover:text-text-main transition-colors">
                  Explore all-time records, rankings, and athletic performances.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Hall of Fame */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/achievements" className="block group h-full">
              <div className="bg-surface-elevated rounded-3xl p-6 border border-white/5 shadow-lg hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 text-primary">
                  <Medal className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-primary transition-colors">Hall of Fame</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-grow group-hover:text-text-main transition-colors">
                  Celebrate outstanding achievements and championship milestones.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Gallery */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/gallery" className="block group h-full">
              <div className="bg-surface-elevated rounded-3xl p-6 border border-white/5 shadow-lg hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 text-primary">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-primary transition-colors">Gallery</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-grow group-hover:text-text-main transition-colors">
                  Browse moments from competitions, training sessions, and club events.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Equipment */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/equipment" className="block group h-full">
              <div className="bg-surface-elevated rounded-3xl p-6 border border-white/5 shadow-lg hover:border-primary/40 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-primary/10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 text-primary">
                  <Archive className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-primary transition-colors">Equipment</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-grow group-hover:text-text-main transition-colors">
                  View available equipment and request usage when needed.
                </p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
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

      {/* Our Team Section */}
      <section className="w-full">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            OUR TEAM
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="h-64">
                <Skeleton className="w-full aspect-square rounded-t-2xl" />
                <Skeleton className="w-2/3 h-4 mt-4 mx-4" />
                <Skeleton className="w-1/2 h-3 mt-2 mx-4 mb-4" />
              </Card>
            ))}
          </div>
        ) : team.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {team.map((member) => (
              <motion.div key={member.id} variants={itemVariants}>
                <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-white/5 shadow-lg group hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden bg-black/20 flex items-center justify-center">
                    {member.photo_url ? (
                      <img 
                        src={member.photo_url} 
                        alt={member.name} 
                        width={member.photo_width}
                        height={member.photo_height}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Users className="w-16 h-16 text-white/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                  </div>
                  
                  <div className="p-5 flex flex-col items-center text-center -mt-8 relative z-10">
                    <h3 className="text-lg font-bold text-white drop-shadow-md mb-1">{member.name}</h3>
                    <div className="text-primary font-black uppercase tracking-wider text-xs mb-3">{member.post}</div>
                    
                    <button 
                      onClick={() => handleCopyEmail(member.email)}
                      className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {member.email}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            icon={Users}
            title="Team Not Found"
            description="The team directory is currently being updated."
          />
        )}
      </section>

      {/* About Us Section */}
      {(content?.about_title || content?.about_content) ? (
        <section className="w-full">
          <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 space-y-6 bg-gradient-to-br from-surface/80 to-surface-elevated/40">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              {content.about_title || "About Us"}
            </h2>
            <div className="space-y-4 text-lg text-text-muted leading-relaxed whitespace-pre-wrap">
              {content.about_content}
            </div>
          </div>
        </section>
      ) : (
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
      )}

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