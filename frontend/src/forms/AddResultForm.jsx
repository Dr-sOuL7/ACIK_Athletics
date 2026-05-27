import { useState } from "react";
import API from "../api/axios";
import { supabase } from "../api/supabase";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function AddResultForm({ refresh }) {
  const [formData, setFormData] = useState({
    athlete_name: "",
    event_name: "",
    position: "",
    performance: "",
    isBest: false,
  });
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photo_url = "";
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        photo_url = data.publicUrl;
      }

      await API.post("/results", {
        ...formData,
        photo_url
      });

      alert("Result uploaded");
      if (refresh) refresh();
      setFormData({
        athlete_name: "",
        event_name: "",
        position: "",
        performance: "",
        isBest: false,
      });
      setPhoto(null);
      document.getElementById('photo-upload').value = '';
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div>
        <label htmlFor="athlete_name" className="block text-sm font-medium text-text-muted mb-1">Athlete Name</label>
        <Input id="athlete_name" type="text" name="athlete_name" value={formData.athlete_name} placeholder="Athlete Name" onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="event_name" className="block text-sm font-medium text-text-muted mb-1">Event Name</label>
        <Input id="event_name" type="text" name="event_name" value={formData.event_name} placeholder="Event Name" onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-text-muted mb-1">Position</label>
        <Input id="position" type="number" name="position" value={formData.position} placeholder="Position" onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="performance" className="block text-sm font-medium text-text-muted mb-1">Performance</label>
        <Input id="performance" type="text" name="performance" value={formData.performance} placeholder="Performance" onChange={handleChange} required />
      </div>
      <label className="flex items-center gap-2 text-white cursor-pointer">
        <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} className="rounded border-white/10 bg-surface/50 w-4 h-4 accent-primary" />
        Mark as Best Athlete
      </label>
      <div>
        <label htmlFor="photo-upload" className="block text-sm font-medium text-text-muted mb-1">Photo (Optional)</label>
        <Input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
      </div>
      <Button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Result"}
      </Button>
    </form>
  );
}