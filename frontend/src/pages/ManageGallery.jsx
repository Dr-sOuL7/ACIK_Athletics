/* eslint-disable */
import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import API from "../api/axios";
import AddPhotoForm from "../forms/AddPhotoForm";
import { Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function ManageGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await API.get("/gallery");
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await API.delete(`/gallery?id=${id}`);
      fetchPhotos();
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo: " + getErrorMessage(err));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} photos?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/gallery?id=${id}`)));
      setSelectedIds([]);
      fetchPhotos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete some photos: " + getErrorMessage(err));
      fetchPhotos();
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map(p => p.id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-heading text-primary font-bold">
          Manage Gallery
        </h1>
        <p className="text-text-muted mt-2">Upload and manage event photos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              Upload Photo
            </h2>
            <AddPhotoForm refresh={fetchPhotos} />
          </div>
        </div>

        {/* Existing Photos Grid */}
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl border border-white/5 min-h-[500px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold">Existing Photos</h2>
              {selectedIds.length > 0 && (
                <Button variant="outline" onClick={handleBulkDelete} className="text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10 gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-white transition-colors w-fit">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-surface text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer"
                  checked={photos.length > 0 && selectedIds.length === photos.length}
                  onChange={toggleSelectAll}
                  disabled={photos.length === 0}
                />
                Select All
              </label>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading photos...
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl">
                <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No photos found. Upload one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(photo => {
                  const isSelected = selectedIds.includes(photo.id);
                  return (
                  <div 
                    key={photo.id} 
                    className={`group relative rounded-xl overflow-hidden border transition-all ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-white/10'} bg-surface-elevated cursor-pointer`}
                    onClick={() => toggleSelect(photo.id)}
                  >
                    <img 
                      src={photo.image_url} 
                      alt={photo.caption || photo.category} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
                        {photo.category}
                      </span>
                      {photo.caption && (
                        <p className="text-sm text-white truncate" title={photo.caption}>{photo.caption}</p>
                      )}
                    </div>
                    
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-white/20 bg-surface text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer shadow-lg"
                        checked={isSelected}
                        onChange={() => toggleSelect(photo.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Delete Overlay */}
                    <div className={`absolute inset-0 bg-black/60 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
