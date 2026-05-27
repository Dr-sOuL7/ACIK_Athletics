import { useState } from "react";
import API from "../api/axios";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export default function EventEditor({ event, refresh }) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    event_date: event.event_date,
    event_time: event.event_time,
    category: event.category,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/events?id=${event.id}`, formData);
      alert("Event updated");
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events?id=${event.id}`);
      alert("Event deleted");
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Edit Event: {event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor={`title-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Title</label>
            <Input id={`title-${event.id}`} name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor={`desc-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Description</label>
            <textarea
              id={`desc-${event.id}`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              rows="3"
            />
          </div>
          <div>
            <label htmlFor={`loc-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Location</label>
            <Input id={`loc-${event.id}`} name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`date-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Date</label>
              <Input id={`date-${event.id}`} type="date" name="event_date" value={formData.event_date} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor={`time-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Time</label>
              <Input id={`time-${event.id}`} type="time" name="event_time" value={formData.event_time} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label htmlFor={`cat-${event.id}`} className="block text-sm font-medium text-text-muted mb-1">Category</label>
            <Input id={`cat-${event.id}`} name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            <Button type="button" variant="destructive" onClick={deleteEvent}>Delete Event</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}