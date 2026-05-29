import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import API from "../api/axios";
import AddAchievementForm from "../forms/AddAchievementForm";
import { Loader2, Trash2, Trophy, Edit, X } from "lucide-react";

export default function ManageAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editForm, setEditForm] = useState({ caption: "", tournament: "", file_url: "" });
  const [editLoading, setEditLoading] = useState(false);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await API.get("/achievements");
      setAchievements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAchievements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await API.delete(`/achievements?id=${id}`);
      fetchAchievements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete achievement: " + getErrorMessage(err));
    }
  };

  const openEdit = (item) => {
    setEditingAchievement(item);
    setEditForm({ caption: item.caption, tournament: item.tournament, file_url: item.file_url });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/achievements?id=${editingAchievement.id}`, editForm);
      alert("Achievement updated successfully!");
      setEditingAchievement(null);
      fetchAchievements();
    } catch (err) {
      console.error(err);
      alert("Failed to update achievement: " + getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-heading text-primary font-bold">
          Manage Achievements
        </h1>
        <p className="text-text-muted mt-2">Add and manage hall of fame achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-white/5 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Add Achievement
            </h2>
            <AddAchievementForm refresh={fetchAchievements} />
          </div>
        </div>

        {/* Existing Achievements Grid */}
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl border border-white/5 min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6">Existing Achievements</h2>
            
            {loading ? (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading achievements...
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl">
                <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No achievements found. Add one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-surface-elevated"
                  >
                    <img 
                      src={item.file_url} 
                      alt={item.caption} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
                        {item.tournament}
                      </span>
                      <p className="text-sm text-white font-medium" title={item.caption}>{item.caption}</p>
                    </div>
                    
                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(item);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                        title="Edit Achievement"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                        title="Delete Achievement"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface glass rounded-3xl w-full max-w-lg p-6 md:p-8 relative border border-white/10 shadow-2xl">
            <button 
              onClick={() => setEditingAchievement(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-white mb-6">Edit Achievement</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Tournament / Event Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={editForm.tournament}
                  onChange={e => setEditForm({...editForm, tournament: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Caption</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={editForm.caption}
                  onChange={e => setEditForm({...editForm, caption: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={editForm.file_url}
                  onChange={e => setEditForm({...editForm, file_url: e.target.value})}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-3 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
