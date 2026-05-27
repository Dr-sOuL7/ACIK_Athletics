/* eslint-disable */
import { useEffect, useState } from "react";
import API from "../api/axios";
import AddEventForm from "../forms/AddEventForm";
import EventEditor from "../components/EventEditor";
import { Skeleton } from "../components/ui/Skeleton";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">Manage Events</h1>
        <p className="text-text-muted">Create, edit, and manage athletic events.</p>
      </div>

      <div className="bg-surface border border-white/5 p-6 rounded-2xl max-w-xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
        <AddEventForm refresh={fetchEvents} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">Existing Events</h2>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] max-w-xl rounded-xl" />
            <Skeleton className="h-[400px] max-w-xl rounded-xl" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-text-muted">No events found.</p>
        ) : (
          events.map((event) => (
            <EventEditor key={event.id} event={event} refresh={fetchEvents} />
          ))
        )}
      </div>
    </div>
  );
}