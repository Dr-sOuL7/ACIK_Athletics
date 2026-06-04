import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import AddEquipmentForm from "../forms/AddEquipmentForm";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Trash2, Loader2, Archive, ClipboardList } from "lucide-react";
import API from "../api/axios";

export default function ManageEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [issuesList, setIssuesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(true);

  const fetchEquipment = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await API.get("/equipment");
      setEquipmentList(res.data);
    } catch (err) {
      console.error("Failed to load equipment", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (showLoader = false) => {
    if (showLoader) setIssuesLoading(true);
    try {
      const res = await API.get("/equipment/issues");
      setIssuesList(res.data);
    } catch (err) {
      console.error("Failed to load issues", err);
    } finally {
      setIssuesLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchIssues();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment? All related issuance history will be removed.")) return;
    try {
      await API.delete(`/equipment?id=${id}`);
      fetchEquipment(true);
      fetchIssues(true);
    } catch (err) {
      console.error(err);
      alert("Failed to delete equipment: " + getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500 mx-auto">
      <div>
        <h1 className="text-4xl font-heading text-white font-bold mb-2">Manage Equipment</h1>
        <p className="text-text-muted">Add/remove inventory and monitor equipment issuances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Add Form */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-primary" />
                Add Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddEquipmentForm refresh={() => fetchEquipment(true)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Inventory & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inventory List */}
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading inventory...</div>
              ) : equipmentList.length === 0 ? (
                <div className="text-text-muted bg-white/5 rounded-lg p-6 text-center border border-white/10">No equipment found. Add some on the left.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {equipmentList.map(item => {
                    const avail = item.available_quantity ?? item.quantity;
                    return (
                      <div key={item.id} className="flex items-start gap-4 bg-surface-elevated p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        {item.image_url ? (
                          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative">
                             <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Archive className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white mb-0.5 truncate pr-2 text-sm">{item.name}</h4>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
                              title="Delete Equipment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className="inline-block text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded tracking-wider uppercase">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded font-medium ${avail > 0 ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-400'}`}>
                              Avail: {avail}
                            </span>
                            <span className="text-text-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              Total: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issuance History */}
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-secondary" />
                Issuance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading history...</div>
              ) : issuesList.length === 0 ? (
                <div className="text-text-muted bg-white/5 rounded-lg p-6 text-center border border-white/10">No equipment has been issued yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-white/5">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs uppercase bg-white/5 text-text-muted border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium">Issued To</th>
                        <th className="px-4 py-3 font-medium">Equipment</th>
                        <th className="px-4 py-3 font-medium">Qty</th>
                        <th className="px-4 py-3 font-medium">Date & Time</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuesList.map((issue) => (
                        <tr key={issue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{issue.name}</div>
                            <div className="text-xs text-text-muted">{issue.batch} • {issue.roll_number}</div>
                          </td>
                          <td className="px-4 py-3 text-white">
                            {issue.equipment?.name || <span className="text-red-400 italic">Deleted Equipment</span>}
                          </td>
                          <td className="px-4 py-3 text-white font-medium">
                            {issue.issue_quantity}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white">{new Date(issue.issue_date).toLocaleDateString()}</div>
                            <div className="text-xs text-text-muted">{issue.from_time.substring(0,5)} - {issue.till_time.substring(0,5)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
