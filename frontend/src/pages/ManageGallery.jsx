import { useState, useEffect, useMemo } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import API from "../api/axios";
import AddPhotoForm from "../forms/AddPhotoForm";
import { Loader2, Trash2, Image as ImageIcon, Filter } from "lucide-react";
import { Button } from "../components/ui/Button";

const TOURNAMENTS = [
  "ALL",
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS",
];

const CATEGORIES = ["ALL", "Track Events", "Field Events", "Relay Events", "Others"];

export default function ManageGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [filterTournament, setFilterTournament] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

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

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchTournament = filterTournament === "ALL" || p.tournament === filterTournament;
      const matchCategory = filterCategory === "ALL" || p.category === filterCategory;
      return matchTournament && matchCategory;
    });
  }, [photos, filterTournament, filterCategory]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length && filteredPhotos.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map(p => p.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-heading text-primary font-bold">
          Manage Gallery
        </h1>
        <p className="text-text-muted mt-2">Upload and manage event photos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 lg:sticky lg:top-8">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold">Existing Photos</h2>
              {selectedIds.length > 0 && (
                <Button variant="outline" onClick={handleBulkDelete} className="text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10 gap-2 shrink-0">
                  <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                <Filter className="w-4 h-4" /> Filters:
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted">Tournament:</label>
                <select 
                  value={filterTournament}
                  onChange={(e) => setFilterTournament(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                >
                  {TOURNAMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted">Category:</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-white transition-colors w-fit">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-surface text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer"
                  checked={filteredPhotos.length > 0 && selectedIds.length === filteredPhotos.length}
                  onChange={toggleSelectAll}
                  disabled={filteredPhotos.length === 0}
                />
                Select All
              </label>
            </div>
            
            {loading ? (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading photos...
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl">
                <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No photos match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredPhotos.map(photo => {
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                          {photo.tournament || "UNSET"}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted bg-white/5 border border-white/5 px-1.5 py-0.5 rounded uppercase">
                          {photo.category}
                        </span>
                      </div>
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
