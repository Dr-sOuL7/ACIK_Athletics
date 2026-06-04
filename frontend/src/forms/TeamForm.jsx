import { useState } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { processImage } from "../utils/imageProcessor";

export default function TeamForm({ initialData = null, onSave, onCancel }) {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    post: initialData?.post || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!initialData?.id;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.post) {
      setError("Please fill all required fields.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let publicUrl = initialData?.photo_url || null;
      let width = initialData?.photo_width || null;
      let height = initialData?.photo_height || null;

      if (file) {
        // Since we want square display on frontend, we don't force crop here to avoid awkward crops.
        // We just optimize. Frontend will use object-cover aspect-square.
        const { file: processedFile, width: w, height: h } = await processImage(file, { maxWidth: 1080, quality: 0.85, outputFormat: 'image/webp' });
        
        const fileExt = processedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `team/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery_images")
          .upload(filePath, processedFile, { contentType: processedFile.type });

        if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);

        const { data } = supabase.storage
          .from("gallery_images")
          .getPublicUrl(filePath);

        publicUrl = data.publicUrl;
        width = w;
        height = h;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        post: formData.post,
        ...(publicUrl && { photo_url: publicUrl, photo_width: width, photo_height: height })
      };

      if (isEdit) {
        await API.put(`/team?id=${initialData.id}`, payload);
      } else {
        await API.post("/team", payload);
      }

      // Cleanup
      if (!isEdit) {
        setFile(null);
        setFormData({ name: "", email: "", post: "" });
      }

      if (onSave) onSave();
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isEdit ? 'update' : 'add'} team member: ` + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Name *</label>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Email *</label>
          <Input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Post / Role *</label>
          <Input 
            name="post"
            value={formData.post}
            onChange={handleChange}
            placeholder="e.g. Club Secretary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">{isEdit ? "Update Photo" : "Profile Photo"}</label>
          <div className="relative border-2 border-dashed border-white/10 rounded-lg p-3 hover:border-primary/50 transition-colors bg-surface-elevated flex items-center justify-center group cursor-pointer h-[42px]">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span className="text-sm font-medium truncate max-w-[250px]">
                {file ? file.name : "Choose an image..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="surface" onClick={onCancel} className="flex-1" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" className={onCancel ? "flex-1" : "w-full"} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isEdit ? "Save Changes" : "Add Team Member"}
        </Button>
      </div>
    </form>
  );
}
