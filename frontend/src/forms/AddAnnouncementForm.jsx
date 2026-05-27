import { useState } from "react";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export default function AddAnnouncementForm({ refresh }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/announcements", formData);
      alert("Announcement added");
      if (refresh) refresh();
      setFormData({ title: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">Title</label>
            <Input id="title" name="title" value={formData.title} placeholder="Announcement Title" onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-muted mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              placeholder="Announcement Message"
              onChange={handleChange}
              className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              rows="4"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}