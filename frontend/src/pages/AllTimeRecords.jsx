import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Search, Calendar, MapPin, Loader2, Medal } from "lucide-react";
import API from "../api/axios";

// Helper to parse time strings into milliseconds for sorting
const parseTime = (timeStr) => {
  if (!timeStr) return Infinity;
  const cleanStr = timeStr.replace(/[^\d:.,]/g, "").replace(",", ".");
  if (!cleanStr) return Infinity;
  
  const parts = cleanStr.split(":");
  let hours = 0, minutes = 0, seconds = 0;
  
  if (parts.length === 3) {
    hours = parseFloat(parts[0]) || 0;
    minutes = parseFloat(parts[1]) || 0;
    seconds = parseFloat(parts[2]) || 0;
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]) || 0;
    seconds = parseFloat(parts[1]) || 0;
  } else if (parts.length === 1) {
    seconds = parseFloat(parts[0]) || 0;
  }
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
};

// Helper to parse distance strings into numbers for sorting
const parseDistance = (distStr) => {
  if (!distStr) return -Infinity;
  const match = distStr.match(/[\d.]+/);
  if (!match) return -Infinity;
  return parseFloat(match[0]) || -Infinity;
};

// Reusable component to render the cards for a specific event
const EventSection = ({ eventName, records }) => {
  if (!records || records.length === 0) return null;
  
  const formatYear = (y) => {
    if (!y) return "";
    const s = String(y).trim();
    if (s.length === 4) return s.slice(2);
    if (s.includes("-")) return s.split("-")[0].slice(2);
    return s;
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold font-heading text-primary mb-4 border-b border-primary/20 pb-2">
        {eventName}
      </h3>
      <div className="space-y-4">
        <AnimatePresence>
          {records.map(record => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={record.id}
              className="group relative glass p-5 rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Decorative Gradient Blob */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {record.gender && (
                      <span className="bg-white/10 text-white/80 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {record.gender}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white mb-1">
                    {record.name}
                  </h3>
                  <p className="text-xs text-text-muted font-mono bg-white/5 inline-block px-2 py-0.5 rounded">
                    {record.roll_number} • Batch {record.batch}
                  </p>
                </div>

                <div className="h-px w-full bg-white/10 my-2" />

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <div className="text-text-muted flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                      <Trophy className="w-3 h-3" /> Record
                    </div>
                    <div className="font-bold text-base text-white">
                      {record.record || "N/A"}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-text-muted flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                      <Calendar className="w-3 h-3" /> Year
                    </div>
                    <div className="font-medium text-white/90">
                      {record.year ? `'${formatYear(record.year)}` : "Unknown"}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-muted flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                      <Medal className="w-3 h-3" /> Tournament
                    </div>
                    <div className="text-white/80 font-medium text-sm">
                      {record.tournament || "Unknown"}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-muted flex items-center gap-1 mb-1 text-[10px] uppercase tracking-wider">
                      <MapPin className="w-3 h-3" /> Venue
                    </div>
                    <div className="text-white/80 font-medium text-sm">
                      {record.place || "Unknown Venue"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function AllTimeRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
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

  const EVENT_CATEGORIES = {
    "Track": ["100 m", "200 m", "400 m", "800 m", "1500 m", "3k m", "5k m", "10k m"],
    "Field": ["Long Jump", "Triple Jump", "Discus Throw", "Javelin Throw", "Shotput Throw"],
    "Relay": ["4 x 100 m", "4 x 400 m", "Medley", "Mixed Relay 4 x 100 m", "Mixed Relay 4 x 400 m"]
  };
  const PREDEFINED_EVENTS = Object.values(EVENT_CATEGORIES).flat();

  // Extract unique events and tournaments for dropdowns
  const uniqueEvents = useMemo(() => {
    return [...new Set(records.map(r => r.event).filter(Boolean))].sort();
  }, [records]);

  const otherEvents = uniqueEvents.filter(ev => !PREDEFINED_EVENTS.includes(ev));

  const PREDEFINED_TOURNAMENTS = [
    "PRATAP",
    "IISM",
    "GANRAJYAM PRIDE RUN",
    "FREEDOM RUN",
    "FRESHERS",
    "INTER BATCH"
  ];

  const PREDEFINED_GENDERS = ["Male", "Female"];
  const PREDEFINED_YEARS = ["27", "26", "25", "24", "23"];

  const uniqueTournaments = useMemo(() => {
    return [...new Set(records.map(r => r.tournament).filter(Boolean))].sort();
  }, [records]);

  const otherTournaments = uniqueTournaments.filter(t => !PREDEFINED_TOURNAMENTS.includes(t));

  const formatYear = (y) => {
    if (!y) return "";
    const s = String(y).trim();
    if (s.length === 4) return s.slice(2);
    if (s.includes("-")) return s.split("-")[0].slice(2);
    return s;
  };

  // Apply filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchEvent = selectedEvent === "" || record.event === selectedEvent;
      const matchTournament = selectedTournament === "" || record.tournament === selectedTournament;
      const matchGender = selectedGender === "" || record.gender === selectedGender;
      const matchYear = selectedYear === "" || formatYear(record.year) === selectedYear;
      
      const query = searchQuery.toLowerCase();
      const matchSearch = query === "" || 
        (record.name || "").toLowerCase().includes(query) || 
        (record.roll_number || "").toLowerCase().includes(query);

      return matchEvent && matchTournament && matchGender && matchYear && matchSearch;
    });
  }, [records, selectedEvent, selectedTournament, selectedGender, selectedYear, searchQuery]);

  // Group records into columns
  const groupedRecords = useMemo(() => {
    const groups = {
      Track: {},
      Field: {},
      Relay: {},
      Other: {}
    };

    filteredRecords.forEach(record => {
      let category = "Other";
      if (EVENT_CATEGORIES.Track.includes(record.event)) category = "Track";
      else if (EVENT_CATEGORIES.Field.includes(record.event)) category = "Field";
      else if (EVENT_CATEGORIES.Relay.includes(record.event)) category = "Relay";

      if (!groups[category][record.event]) {
        groups[category][record.event] = [];
      }
      groups[category][record.event].push(record);
    });

    // Sort records inside each event group
    Object.keys(groups).forEach(category => {
      Object.keys(groups[category]).forEach(event => {
        groups[category][event].sort((a, b) => {
          if (category === "Field") {
            // Descending order for distances (highest distance first)
            return parseDistance(b.record) - parseDistance(a.record);
          } else {
            // Ascending order for times (lowest time first)
            return parseTime(a.record) - parseTime(b.record);
          }
        });
      });
    });

    return groups;
  }, [filteredRecords]);

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
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
                {PREDEFINED_TOURNAMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                {otherTournaments.length > 0 && (
                  <optgroup label="Other Tournaments" className="bg-surface text-text-muted">
                    {otherTournaments.map(t => <option key={t} value={t} className="text-white">{t}</option>)}
                  </optgroup>
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm text-text-muted font-medium ml-1">Year</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {PREDEFINED_YEARS.map(y => <option key={y} value={y}>'{y}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                ▼
              </div>
            </div>
          </div>

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
                {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                  <optgroup key={category} label={category} className="bg-surface text-text-muted">
                    {events.map(ev => <option key={ev} value={ev} className="text-white">{ev}</option>)}
                  </optgroup>
                ))}
                {otherEvents.length > 0 && (
                  <optgroup label="Other Events" className="bg-surface text-text-muted">
                    {otherEvents.map(ev => <option key={ev} value={ev} className="text-white">{ev}</option>)}
                  </optgroup>
                )}
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
                {PREDEFINED_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
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
              onClick={() => { setSelectedEvent(""); setSelectedTournament(""); setSelectedGender(""); setSelectedYear(""); setSearchQuery(""); }}
              className="mt-6 text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: Track */}
              <div>
                <h2 className="text-2xl font-black font-heading text-white/20 mb-8 tracking-widest uppercase text-center border-b border-white/5 pb-4">Track Events</h2>
                {EVENT_CATEGORIES.Track.map(eventName => (
                  <EventSection key={eventName} eventName={eventName} records={groupedRecords.Track[eventName]} />
                ))}
              </div>

              {/* Column 2: Field */}
              <div>
                <h2 className="text-2xl font-black font-heading text-white/20 mb-8 tracking-widest uppercase text-center border-b border-white/5 pb-4">Field Events</h2>
                {EVENT_CATEGORIES.Field.map(eventName => (
                  <EventSection key={eventName} eventName={eventName} records={groupedRecords.Field[eventName]} />
                ))}
              </div>

              {/* Column 3: Relay */}
              <div>
                <h2 className="text-2xl font-black font-heading text-white/20 mb-8 tracking-widest uppercase text-center border-b border-white/5 pb-4">Relay Events</h2>
                {EVENT_CATEGORIES.Relay.map(eventName => (
                  <EventSection key={eventName} eventName={eventName} records={groupedRecords.Relay[eventName]} />
                ))}
              </div>
            </div>

            {/* Other Events */}
            {Object.keys(groupedRecords.Other).length > 0 && (
              <div className="mt-16 pt-16 border-t border-white/5">
                <h2 className="text-2xl font-black font-heading text-white/20 mb-8 tracking-widest uppercase text-center">Other Events</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {Object.entries(groupedRecords.Other).map(([eventName, records]) => (
                    <div key={eventName}>
                      <EventSection eventName={eventName} records={records} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
