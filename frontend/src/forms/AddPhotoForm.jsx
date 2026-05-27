import { useState } from "react";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2, ImagePlus } from "lucide-react";
import { Button } from "../components/ui/Button";

const categories = [
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS"
];

export default function AddPhotoForm({ refresh }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("IISM");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery_images")
        .upload(filePath, file);

      if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("gallery_images")
        .getPublicUrl(filePath);

      // 3. Save to database
      await API.post("/gallery", {
        image_url: publicUrl,
        category: category,
        caption: caption,
      });

      // 4. Cleanup and refresh
      setFile(null);
      setCaption("");
      if (refresh) refresh();

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">Select Photo</label>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-primary" />
              <p className="mb-2 text-sm text-text-muted">
                {file ? <span className="text-white font-medium">{file.name}</span> : <span><span className="font-semibold text-white">Click to upload</span> or drag and drop</span>}
              </p>
            </div>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files[0])} 
              disabled={loading} 
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
          required
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Caption (Optional)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. 100m Sprint Finals"
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading || !file}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
        {loading ? "Uploading..." : "Upload Photo"}
      </Button>
    </form>
  );
}
