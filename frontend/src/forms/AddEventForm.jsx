import { useState } from "react";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function AddEventForm({ refresh }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    event_time: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/events", formData);
      alert("Event created");
      if (refresh) refresh();
      setFormData({
        title: "",
        description: "",
        location: "",
        event_date: "",
        event_time: "",
        category: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">Event Title</label>
        <Input id="title" name="title" value={formData.title} placeholder="Event Title" onChange={handleChange} required />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-muted mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          placeholder="Description"
          onChange={handleChange}
          className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          rows="3"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-text-muted mb-1">Location</label>
        <Input id="location" name="location" value={formData.location} placeholder="Location" onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-text-muted mb-1">Date</label>
          <Input id="event_date" type="date" name="event_date" value={formData.event_date} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="event_time" className="block text-sm font-medium text-text-muted mb-1">Time</label>
          <Input id="event_time" type="time" name="event_time" value={formData.event_time} onChange={handleChange} required />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-muted mb-1">Category</label>
        <Input id="category" name="category" value={formData.category} placeholder="Category" onChange={handleChange} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}