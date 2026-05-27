import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../utils/cn";

const categories = [
  "ALL",
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS"
];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await API.get("/gallery");
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = activeTab === "ALL" 
    ? photos 
    : photos.filter(p => p.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-heading text-primary font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
          Athletics Gallery
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          Relive the best moments from our track and field events.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              activeTab === cat 
                ? "bg-primary text-background shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                : "bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : filteredPhotos.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No Photos Found" description="There are no photos in this category yet." />
      ) : (
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer border border-white/10"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.image_url} 
                  alt={photo.caption || photo.category} 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">{photo.caption}</p>
                    <span className="text-xs text-primary">{photo.category}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center gap-4">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors text-xl font-bold"
              onClick={() => setSelectedPhoto(null)}
            >
              Close ✕
            </button>
            <img 
              src={selectedPhoto.image_url} 
              alt={selectedPhoto.caption} 
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10" 
            />
            {(selectedPhoto.caption || selectedPhoto.category) && (
              <div className="text-center">
                {selectedPhoto.caption && <h3 className="text-xl font-bold text-white">{selectedPhoto.caption}</h3>}
                <p className="text-primary font-medium">{selectedPhoto.category}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
