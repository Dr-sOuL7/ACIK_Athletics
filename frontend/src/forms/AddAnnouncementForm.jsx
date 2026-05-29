import { useState } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";

export default function AddAnnouncementForm({ refresh }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const attachments = [];

      // Upload all files concurrently
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("announcement_files")
            .upload(filePath, file);

          if (uploadError) throw new Error(`Failed to upload ${file.name}: ` + uploadError.message);

          const { data: { publicUrl } } = supabase.storage
            .from("announcement_files")
            .getPublicUrl(filePath);

          return { url: publicUrl, name: file.name };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        attachments.push(...uploadedFiles);
      }

      await API.post("/announcements", {
        ...formData,
        ...(attachments.length > 0 && { attachments })
      });
      alert("Announcement added");
      if (refresh) refresh();
      setFormData({ title: "", message: "" });
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Failed to publish announcement: " + getErrorMessage(err));
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
            <label className="block text-sm font-medium text-text-muted mb-1">Attachments (Optional)</label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-surface-elevated border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-white text-sm truncate">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} className="text-text-muted hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-6 h-6 mb-1 text-primary" />
                  <p className="text-xs text-text-muted"><span className="text-white font-medium">Click to attach files</span> (Multiple allowed)</p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={loading} />
              </label>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-2 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}