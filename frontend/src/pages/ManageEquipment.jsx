import { useState, useEffect, useMemo } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import AddEquipmentForm from "../forms/AddEquipmentForm";
import EditEquipmentForm from "../forms/EditEquipmentForm";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Trash2, Loader2, Archive, ClipboardList, Pencil, Search, Filter } from "lucide-react";
import API from "../api/axios";

export default function ManageEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const categories = ["All", "Track Events", "Field Events", "Relay Events", "Others"];

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [equipmentList, searchQuery, selectedCategory]);

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

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment? All related issuance history will be removed.")) return;
    try {
      await API.delete(`/equipment?id=${id}`);
      fetchEquipment(true);
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

        {/* Right Column - Inventory */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inventory List */}
          <Card className="border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Equipment Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input 
                    placeholder="Search equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-surface-elevated h-9 text-sm w-full"
                  />
                </div>
                <div className="relative shrink-0 sm:w-48">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-9 w-full bg-surface-elevated border border-white/10 rounded-lg h-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading inventory...</div>
              ) : filteredEquipment.length === 0 ? (
                <div className="text-text-muted bg-white/5 rounded-lg p-6 text-center border border-white/10">No equipment found matching filters.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredEquipment.map(item => {
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
                            <div className="flex gap-1 shrink-0">
                              <button 
                                onClick={() => {
                                  setEditingEquipment(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Edit Equipment"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete Equipment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className="inline-block text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded tracking-wider uppercase">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="text-text-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              Quantity: {item.quantity}
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


        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Equipment">
        {editingEquipment && (
          <EditEquipmentForm 
            equipment={editingEquipment} 
            onSave={() => {
              setIsEditModalOpen(false);
              fetchEquipment(true);
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

    </div>
  );
}
