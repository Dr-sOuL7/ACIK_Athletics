import { useEffect, useState } from "react";
import API from "../api/axios";
import RankingEditor from "../components/RankingEditor";
import AddRankingForm from "../forms/AddRankingForm";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";

export default function ManageRankings() {
  const [rankings, setRankings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("All");
  const [loading, setLoading] = useState(true);

  async function fetchRankings() {
    try {
      const res = await API.get("/rankings");
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRankings();
  }, []);

  async function deleteRanking(id) {
    if (!window.confirm("Are you sure you want to delete this ranking?")) return;
    try {
      await API.delete(`/rankings/${id}`);
      fetchRankings();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  const uniqueEvents = ["All", ...new Set(rankings.map((item) => item.event_name))];
  const filteredRankings = selectedEvent === "All" ? rankings : rankings.filter((item) => item.event_name === selectedEvent);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">Manage Rankings</h1>
        <p className="text-text-muted">Add, edit, delete, and filter event rankings</p>
      </div>

      <div className="bg-surface border border-white/5 p-6 rounded-2xl max-w-xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Ranking</h2>
        <AddRankingForm refresh={fetchRankings} />
      </div>

      <div className="bg-surface border border-white/5 p-6 rounded-2xl max-w-xl">
        <h2 className="text-xl font-bold text-white mb-4">Filter Rankings</h2>
        <label htmlFor="eventFilter" className="sr-only">Filter by Event</label>
        <select
          id="eventFilter"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-surface-elevated text-white border border-white/10 p-3 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {uniqueEvents.map((event, index) => (
            <option key={index} value={event}>{event}</option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">Existing Rankings</h2>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[250px] max-w-xl rounded-xl" />
            <Skeleton className="h-[250px] max-w-xl rounded-xl" />
          </div>
        ) : filteredRankings.length === 0 ? (
          <p className="text-text-muted">No rankings found.</p>
        ) : (
          filteredRankings.map((item) => (
            <div key={item.id} className="max-w-xl relative">
              <RankingEditor item={item} refresh={fetchRankings} />
              <div className="absolute bottom-6 right-6">
                <Button variant="destructive" onClick={() => deleteRanking(item.id)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}