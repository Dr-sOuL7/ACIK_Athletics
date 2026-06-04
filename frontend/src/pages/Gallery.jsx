/* eslint-disable */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { Image as ImageIcon, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  "OTHERS",
];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState(null); // index into filteredPhotos

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

  useEffect(() => {
    fetchPhotos();
  }, []);

  const filteredPhotos =
    activeTab === "ALL" ? photos : photos.filter((p) => p.category === activeTab);

  // ── Lightbox helpers ──────────────────────────────────────────────────────

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const goPrev = useCallback(
    (e) => {
      e?.stopPropagation();
      setLightboxIndex((i) => (i > 0 ? i - 1 : filteredPhotos.length - 1));
    },
    [filteredPhotos.length]
  );

  const goNext = useCallback(
    (e) => {
      e?.stopPropagation();
      setLightboxIndex((i) => (i < filteredPhotos.length - 1 ? i + 1 : 0));
    },
    [filteredPhotos.length]
  );

  // Keyboard nav
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  const selectedPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-heading text-primary font-extrabold tracking-tight">
          Athletics Gallery
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          Relive the best moments from our track and field events.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              activeTab === cat
                ? "bg-primary text-background shadow-lg shadow-black/30"
                : "bg-surface border border-white/10 text-text-muted hover:text-white hover:border-white/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : filteredPhotos.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No Photos Found"
          description="There are no photos in this category yet."
        />
      ) : (
        <motion.div
          layout
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => {
              // Use stored dimensions for aspect-ratio placeholder to prevent CLS.
              // If not stored (legacy photos), fall back gracefully with a min-height.
              const hasRatio = photo.width && photo.height;
              const aspectRatio = hasRatio
                ? `${photo.width} / ${photo.height}`
                : undefined;

              return (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-surface-elevated/50"
                  style={hasRatio ? { aspectRatio } : { minHeight: "200px" }}
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || photo.category}
                    width={photo.width || undefined}
                    height={photo.height || undefined}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium line-clamp-2">{photo.caption}</p>
                      <span className="text-xs text-primary">{photo.category}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            {filteredPhotos.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={goPrev}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next */}
            {filteredPhotos.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={goNext}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image container */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center gap-4 max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.caption || selectedPhoto.category}
                width={selectedPhoto.width || undefined}
                height={selectedPhoto.height || undefined}
                className="max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
              />
              {(selectedPhoto.caption || selectedPhoto.category) && (
                <div className="text-center">
                  {selectedPhoto.caption && (
                    <h3 className="text-lg font-bold text-white">{selectedPhoto.caption}</h3>
                  )}
                  <p className="text-primary text-sm font-medium">{selectedPhoto.category}</p>
                </div>
              )}
              {filteredPhotos.length > 1 && (
                <p className="text-text-muted text-xs">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
