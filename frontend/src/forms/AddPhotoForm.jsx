import { useState } from "react";
import { getErrorMessage } from "../utils/errorHelper";
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
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("IISM");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select at least one file.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Upload all files concurrently
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery_images")
          .upload(filePath, file);

        if (uploadError) throw new Error(`Failed to upload ${file.name}: ` + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("gallery_images")
          .getPublicUrl(filePath);

        await API.post("/gallery", {
          image_url: publicUrl,
          category: category,
          caption: caption,
        });
      });

      await Promise.all(uploadPromises);

      // Cleanup and refresh
      setFiles([]);
      setCaption("");
      if (refresh) refresh();

    } catch (err) {
      console.error(err);
      setError("Failed to upload photos: " + getErrorMessage(err));
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
                {files.length > 0 ? (
                  <span className="text-white font-medium">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                ) : (
                  <span><span className="font-semibold text-white">Click to upload</span> or drag and drop</span>
                )}
              </p>
            </div>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              multiple
              className="hidden" 
              onChange={(e) => setFiles(Array.from(e.target.files))} 
              disabled={loading} 
            />
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="bg-white/10 px-3 py-1 rounded text-xs flex items-center gap-2">
                <span className="truncate max-w-[150px]">{f.name}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
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

      <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading || files.length === 0}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
        {loading ? "Uploading..." : `Upload ${files.length > 1 ? files.length + ' Photos' : 'Photo'}`}
      </Button>
    </form>
  );
}
