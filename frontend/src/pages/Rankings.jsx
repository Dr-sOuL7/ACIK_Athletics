import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Filter, Medal } from "lucide-react";
import API from "../api/axios";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../utils/cn";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await API.get("/results/rankings");
        setRankings(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const uniqueEvents = ["All", ...new Set(rankings.map((item) => item.event_name))];

  const filteredRankings = selectedEvent === "All"
    ? rankings
    : rankings.filter((item) => item.event_name === selectedEvent);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-surface-elevated pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Rankings</h1>
          <p className="text-text-muted mt-1">Overall athlete standings and medals</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-text-muted" />
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-surface border border-surface-elevated text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none transition-colors"
        >
          {uniqueEvents.map((event) => (
            <option key={event} value={event}>
              {event === "All" ? "All Events" : event}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="w-full bg-surface border border-surface-elevated rounded-2xl overflow-hidden">
          <div className="h-14 bg-surface-elevated border-b border-surface-hover" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex h-16 items-center px-4 border-b border-surface-elevated/50">
              <Skeleton className="w-full h-6" />
            </div>
          ))}
        </div>
      ) : filteredRankings.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-surface-elevated shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-elevated text-text-muted uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-2xl">Rank</th>
                <th className="p-4">Athlete</th>
                <th className="p-4">Event</th>
                <th className="p-4 text-center">🥇 Gold</th>
                <th className="p-4 text-center">🥈 Silver</th>
                <th className="p-4 text-center">🥉 Bronze</th>
                <th className="p-4 text-right rounded-tr-2xl">Points</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-surface divide-y divide-surface-elevated"
            >
              {filteredRankings.map((item, index) => (
                <motion.tr 
                  key={item.id} 
                  variants={itemVariants}
                  className="hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="p-4">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                      item.ranking_position === 1 ? "bg-yellow-500/20 text-yellow-500" :
                      item.ranking_position === 2 ? "bg-slate-400/20 text-slate-400" :
                      item.ranking_position === 3 ? "bg-orange-600/20 text-orange-500" :
                      "bg-surface-elevated text-text-muted"
                    )}>
                      {item.ranking_position}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-white">{item.athlete_name}</td>
                  <td className="p-4 text-text-muted">{item.event_name}</td>
                  <td className="p-4 text-center font-bold text-yellow-500">{item.gold_medals}</td>
                  <td className="p-4 text-center font-bold text-slate-400">{item.silver_medals}</td>
                  <td className="p-4 text-center font-bold text-orange-500">{item.bronze_medals}</td>
                  <td className="p-4 text-right font-bold text-primary">{item.total_points}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          icon={Medal}
          title="No rankings found"
          description="There are currently no rankings available for this selection."
        />
      )}
    </div>
  );
}