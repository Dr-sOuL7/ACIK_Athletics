import { useState } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { processImage } from "../utils/imageProcessor";

export default function AddEquipmentForm({ refresh }) {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    category: "Track Events",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "Track Events",
    "Field Events",
    "Relay Events",
    "Others"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Please provide an equipment name.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let publicUrl = null;
      let width = null;
      let height = null;

      if (file) {
        const { file: processedFile, width: w, height: h } = await processImage(file, { maxWidth: 1920, quality: 0.85, outputFormat: 'image/webp' });
        
        const fileExt = processedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `equipment/${fileName}`;

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

      await API.post("/equipment", {
        name: formData.name,
        quantity: formData.quantity,
        category: formData.category,
        description: formData.description,
        ...(publicUrl && { image_url: publicUrl, image_width: width, image_height: height })
      });

      // Cleanup and refresh
      setFile(null);
      setFormData({
        name: "",
        quantity: 0,
        category: "Track Events",
        description: "",
      });
      if (refresh) refresh();

    } catch (err) {
      console.error(err);
      setError("Failed to add equipment: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Equipment Name *</label>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Javelin (800g)"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Quantity *</label>
          <Input 
            type="number"
            name="quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Event Category *</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/30"
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Equipment Image</label>
          <div className="relative border-2 border-dashed border-white/10 rounded-lg p-3 hover:border-primary/50 transition-colors bg-surface-elevated flex items-center justify-center group cursor-pointer h-[42px]">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span className="text-sm font-medium">
                {file ? file.name : "Choose an image..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Description (Optional)</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brand, condition, location..."
          className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/30 resize-y min-h-[80px]"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Equipment"}
      </Button>
    </form>
  );
}
