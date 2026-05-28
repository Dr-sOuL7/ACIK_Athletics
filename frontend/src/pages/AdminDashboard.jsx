import { useState, useEffect } from "react";
import AddAnnouncementForm from "../forms/AddAnnouncementForm";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Activity, Megaphone, Trash2, Loader2 } from "lucide-react";
import API from "../api/axios";

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await API.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await API.delete(`/announcements?id=${id}`);
      fetchAnnouncements(true);
    } catch (err) {
      console.error(err);
      alert("Failed to delete announcement");
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading text-white font-bold mb-2">Admin Dashboard</h1>
        <p className="text-text-muted">Manage platform data and results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-surface border-white/5 flex items-center p-4">
          <Megaphone className="w-8 h-8 text-primary mr-4" />
          <div>
            <div className="text-sm text-text-muted">Quick Action</div>
            <div className="font-bold text-white">Add Announcement</div>
          </div>
        </Card>
        <Card className="bg-surface border-white/5 flex items-center p-4">
          <Activity className="w-8 h-8 text-success mr-4" />
          <div>
            <div className="text-sm text-text-muted">System Status</div>
            <div className="font-bold text-white">Online</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Add Announcement</CardTitle>
          </CardHeader>
          <AddAnnouncementForm refresh={() => fetchAnnouncements(true)} />
        </Card>

        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Manage Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-text-muted">No announcements found.</div>
            ) : (
              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex items-start justify-between bg-surface-elevated p-4 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white mb-1">{ann.title}</h4>
                      <p className="text-sm text-text-muted line-clamp-2">{ann.message}</p>
                      {(ann.file_url || (ann.attachments && ann.attachments.length > 0)) && (
                        <span className="inline-block mt-2 text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded">
                          Has Attachment(s)
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
