import { useEffect, useState } from "react";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

export default function EditHomepage() {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    announcement: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/homepage");
        setFormData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/homepage", formData);
      alert("Homepage updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update homepage");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-xl">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-xl">
      <div>
        <h1 className="text-4xl font-heading text-white font-bold mb-2">Edit Homepage</h1>
        <p className="text-text-muted">Customize the landing page content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">Hero Title</label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Main title" />
            </div>
            
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-text-muted mb-1">Hero Subtitle</label>
              <Input id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtitle or tagline" />
            </div>
            
            <div>
              <label htmlFor="announcement" className="block text-sm font-medium text-text-muted mb-1">Announcement Box</label>
              <textarea
                id="announcement"
                name="announcement"
                value={formData.announcement}
                onChange={handleChange}
                placeholder="Important announcements..."
                className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                rows="5"
              />
            </div>
            
            <Button type="submit" disabled={saving} className="mt-4">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}