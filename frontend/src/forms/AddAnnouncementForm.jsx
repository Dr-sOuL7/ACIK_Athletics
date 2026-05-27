import { useState } from "react";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

export default function AddAnnouncementForm({ refresh }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let file_url = undefined;
      let file_name = undefined;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("announcement_files")
          .upload(filePath, file);

        if (uploadError) throw new Error("Failed to upload file: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("announcement_files")
          .getPublicUrl(filePath);

        file_url = publicUrl;
        file_name = file.name;
      }

      await API.post("/announcements", {
        ...formData,
        ...(file_url && { file_url }),
        ...(file_name && { file_name })
      });
      alert("Announcement added");
      if (refresh) refresh();
      setFormData({ title: "", message: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add announcement");
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

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Attachment (Optional)</label>
            {file ? (
              <div className="flex items-center justify-between bg-surface-elevated border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-white text-sm truncate">{file.name}</span>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-text-muted hover:text-red-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-6 h-6 mb-1 text-primary" />
                  <p className="text-xs text-text-muted"><span className="text-white font-medium">Click to attach file</span> (Any format)</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} disabled={loading} />
              </label>
            )}
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}