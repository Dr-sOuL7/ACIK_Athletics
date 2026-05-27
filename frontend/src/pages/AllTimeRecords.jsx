import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Search, Calendar, MapPin, Loader2 } from "lucide-react";
import API from "../api/axios";

export default function AllTimeRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await API.get("/records");
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  // Extract unique events and tournaments for dropdowns
  const uniqueEvents = useMemo(() => {
    return [...new Set(records.map(r => r.event).filter(Boolean))].sort();
  }, [records]);

  const uniqueTournaments = useMemo(() => {
    return [...new Set(records.map(r => r.tournament).filter(Boolean))].sort();
  }, [records]);

  const uniqueGenders = useMemo(() => {
    return [...new Set(records.map(r => r.gender).filter(Boolean))].sort();
  }, [records]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchEvent = selectedEvent === "" || record.event === selectedEvent;
      const matchTournament = selectedTournament === "" || record.tournament === selectedTournament;
      const matchGender = selectedGender === "" || record.gender === selectedGender;
      
      const query = searchQuery.toLowerCase();
      const matchSearch = query === "" || 
        (record.name || "").toLowerCase().includes(query) || 
        (record.roll_number || "").toLowerCase().includes(query);

      return matchEvent && matchTournament && matchGender && matchSearch;
    });
  }, [records, selectedEvent, selectedTournament, selectedGender, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Records Database
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
          Explore the comprehensive database of historical achievements, legendary performances, and event records of our athletes.
        </p>
      </div>

      {/* Filter Section */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center gap-2 mb-2 text-xl font-bold text-white/90">
          <Search className="w-5 h-5 text-primary" /> Find a Record
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Event Filter */}
          <div className="space-y-2">
            <label className="text-sm text-text-muted font-medium ml-1">Event Category</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">All Events</option>
                {uniqueEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* Tournament Filter */}
          <div className="space-y-2">
            <label className="text-sm text-text-muted font-medium ml-1">Tournament</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
              >
                <option value="">All Tournaments</option>
                {uniqueTournaments.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-sm text-text-muted font-medium ml-1">Gender</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="">All Genders</option>
                {uniqueGenders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* Search by Name/Roll */}
          <div className="space-y-2">
            <label className="text-sm text-text-muted font-medium ml-1">Search Athlete</label>
            <input 
              type="text"
              placeholder="Name or Roll Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-text-muted">
          <span>Showing {filteredRecords.length} records</span>
          {filteredRecords.length > 0 && <span className="text-sm">Sorted chronologically</span>}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border border-white/5">
            <Trophy className="w-16 h-16 mx-auto text-white/10 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Records Found</h3>
            <p className="text-text-muted">Try adjusting your filters to see more results.</p>
            <button 
              onClick={() => { setSelectedEvent(""); setSelectedTournament(""); setSearchQuery(""); }}
              className="mt-6 text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={record.id}
                  className="group relative glass p-6 rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-colors"
                >
                  {/* Decorative Gradient Blob */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* IISM Badge */}
                  {record.iism_record && record.iism_record !== "null" && record.iism_record !== "" && (
                    <div className="absolute top-4 right-4 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Medal className="w-3 h-3" /> IISM Record
                    </div>
                  )}

                  <div className="relative z-10 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">
                          {record.event}
                        </span>
                        {record.gender && (
                          <span className="bg-white/10 text-white/80 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {record.gender}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-white mb-1">
                        {record.name}
                      </h3>
                      <p className="text-sm text-text-muted font-mono bg-white/5 inline-block px-2 py-0.5 rounded">
                        {record.roll_number} • Batch {record.batch}
                      </p>
                    </div>

                    <div className="h-px w-full bg-white/10 my-4" />

                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <div className="text-text-muted flex items-center gap-1 mb-1">
                          <Trophy className="w-4 h-4" /> Record
                        </div>
                        <div className="font-bold text-lg text-white">
                          {record.record || "N/A"}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-text-muted flex items-center gap-1 mb-1">
                          <Calendar className="w-4 h-4" /> Date
                        </div>
                        <div className="font-medium text-white/90">
                          {record.date || "Unknown"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-text-muted flex items-center gap-1 text-xs mb-1 uppercase tracking-wider">
                        <MapPin className="w-3 h-3" /> {record.tournament || "Tournament"}
                      </div>
                      <div className="text-white/80 font-medium">
                        {record.place || "Unknown Location"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
