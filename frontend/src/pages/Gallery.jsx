/* eslint-disable */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { Image as ImageIcon, Loader2, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../utils/cn";

const TOURNAMENTS = [
  "ALL",
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS",
];

const CATEGORIES = ["ALL", "Track Events", "Field Events", "Relay Events", "Others"];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTournament, setActiveTournament] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState("ALL");
  
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

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchTournament = activeTournament === "ALL" || p.tournament === activeTournament;
      const matchCategory = activeCategory === "ALL" || p.category === activeCategory;
      return matchTournament && matchCategory;
    });
  }, [photos, activeTournament, activeCategory]);

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

      {/* Dual Filters */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8 bg-surface-elevated/30 border border-white/5 p-4 rounded-2xl mx-auto max-w-4xl">
        
        {/* Tournament Filter */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tournament</span>
          <div className="flex flex-wrap justify-center gap-2">
            {TOURNAMENTS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTournament(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                  activeTournament === t
                    ? "bg-primary text-background border-primary shadow-lg shadow-primary/20"
                    : "bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/30"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-white/10"></div>

        {/* Event Category Filter */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Event Category</span>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                  activeCategory === c
                    ? "bg-secondary text-background border-secondary shadow-lg shadow-secondary/20"
                    : "bg-surface border-white/10 text-text-muted hover:text-white hover:border-white/30"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
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
          description="There are no photos matching your selected filters."
        />
      ) : (
        <motion.div
          layout
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => {
              // Use stored dimensions for aspect-ratio placeholder to prevent CLS.
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
                    alt={photo.caption || photo.tournament}
                    width={photo.width || undefined}
                    height={photo.height || undefined}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle overlay indicator so user knows it's clickable, without cluttering image */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Premium Lightbox ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-xl p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            {filteredPhotos.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 hidden md:block"
                onClick={goPrev}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next */}
            {filteredPhotos.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 hidden md:block"
                onClick={goNext}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Content Container */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative flex flex-col items-center gap-6 max-w-6xl w-full h-full justify-center pt-8 md:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative max-h-[75vh] w-full flex justify-center">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption || "Gallery Photo"}
                  width={selectedPhoto.width || undefined}
                  height={selectedPhoto.height || undefined}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                />
              </div>

              {/* Metadata */}
              <div className="text-center w-full max-w-3xl space-y-3 px-4">
                {selectedPhoto.caption ? (
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                    {selectedPhoto.caption}
                  </h3>
                ) : (
                  <div className="h-4"></div> /* Spacer if no caption */
                )}
                
                <div className="flex items-center justify-center gap-3">
                  {selectedPhoto.tournament && selectedPhoto.tournament !== "OTHERS" && (
                    <span className="text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      {selectedPhoto.tournament}
                    </span>
                  )}
                  {selectedPhoto.category && selectedPhoto.category !== "Others" && (
                    <span className="text-sm font-semibold text-text-muted bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      {selectedPhoto.category}
                    </span>
                  )}
                </div>

                {/* Mobile controls (visible only on small screens) */}
                <div className="flex items-center justify-center gap-4 mt-6 md:hidden">
                  <button onClick={goPrev} className="p-3 rounded-full bg-white/5 border border-white/10">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <p className="text-text-muted text-sm font-medium min-w-[3rem] text-center">
                    {lightboxIndex + 1} / {filteredPhotos.length}
                  </p>
                  <button onClick={goNext} className="p-3 rounded-full bg-white/5 border border-white/10">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Desktop indicator */}
                <div className="hidden md:block absolute bottom-4 right-4">
                  <p className="text-text-muted/50 text-sm font-medium">
                    {lightboxIndex + 1} of {filteredPhotos.length}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
