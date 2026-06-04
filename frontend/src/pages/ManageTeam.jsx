import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import TeamForm from "../forms/TeamForm";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Trash2, Loader2, Users, Pencil } from "lucide-react";
import API from "../api/axios";

export default function ManageTeam() {
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const fetchTeam = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await API.get("/team");
      setTeamList(res.data);
    } catch (err) {
      console.error("Failed to load team", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      await API.delete(`/team?id=${id}`);
      fetchTeam(true);
    } catch (err) {
      console.error(err);
      alert("Failed to delete team member: " + getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500 mx-auto">
      <div>
        <h1 className="text-4xl font-heading text-white font-bold mb-2">Manage Team</h1>
        <p className="text-text-muted">Add or update team members displayed on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Add Form */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Add Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamForm onSave={() => fetchTeam(true)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Team List */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle>Team Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading team...</div>
              ) : teamList.length === 0 ? (
                <div className="text-text-muted bg-white/5 rounded-lg p-6 text-center border border-white/10">No team members found. Add some on the left.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teamList.map(member => (
                    <div key={member.id} className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      {member.photo_url ? (
                        <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-white/5 border border-white/10 relative">
                           <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover aspect-square" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white mb-0.5 truncate pr-2 text-sm">{member.name}</h4>
                          <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => {
                                setEditingMember(member);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Edit Member"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(member.id)}
                              className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-primary text-xs font-bold uppercase tracking-wider mb-0.5 truncate">
                          {member.post}
                        </div>
                        <div className="text-text-muted text-[10px] truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Team Member">
        {editingMember && (
          <TeamForm 
            initialData={editingMember} 
            onSave={() => {
              setIsEditModalOpen(false);
              fetchTeam(true);
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

    </div>
  );
}
