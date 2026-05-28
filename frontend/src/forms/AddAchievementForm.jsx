import { useState } from "react";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2, Trophy } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function AddAchievementForm({ refresh }) {
  const [file, setFile] = useState(null);
  const [tournament, setTournament] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!caption || !tournament) {
      setError("Please provide both a caption and a tournament.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `achievements/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery_images")
        .upload(filePath, file);

      if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("gallery_images")
        .getPublicUrl(filePath);

      await API.post("/achievements", {
        file_url: publicUrl,
        tournament: tournament,
        caption: caption,
      });

      // Cleanup and refresh
      setFile(null);
      setCaption("");
      setTournament("");
      if (refresh) refresh();

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add achievement.");
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
        <label className="block text-sm font-medium text-text-muted mb-2">Select Image</label>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="achievement-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors overflow-hidden relative">
            {file ? (
              <div className="absolute inset-0 w-full h-full p-2">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain rounded-lg opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-white font-medium text-sm truncate max-w-[80%]">{file.name}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                <p className="mb-2 text-sm text-text-muted">
                  <span className="font-semibold text-white">Click to upload</span> or drag and drop
                </p>
              </div>
            )}
            <input 
              id="achievement-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files[0])} 
              disabled={loading} 
            />
          </label>
        </div>
        {file && (
          <div className="mt-2 text-center">
            <button type="button" onClick={() => setFile(null)} className="text-red-400 text-xs hover:underline">
              Remove Image
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Tournament</label>
        <input
          type="text"
          value={tournament}
          onChange={(e) => setTournament(e.target.value)}
          placeholder="e.g. IISM 2024"
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Caption</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. Gold Medal in 100m Sprint"
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
          required
        />
      </div>

      <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading || !file}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
        {loading ? "Adding..." : "Add Achievement"}
      </Button>
    </form>
  );
}
