import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, Search, AlertCircle, Filter, Plus, ChevronDown, Check } from "lucide-react";
import API from "../api/axios";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHelper";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80 } }
};

const CATEGORIES = ["Track Events", "Field Events", "Relay Events", "Others"];

function SearchableEquipmentSelect({ options, value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full bg-surface-elevated border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 cursor-pointer text-white`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-white truncate" : "text-white/30 truncate"}>
          {selectedOption ? `${selectedOption.name} (Avail: ${selectedOption.available_quantity})` : "Select Equipment..."}
        </span>
        <ChevronDown className="w-4 h-4 text-text-muted shrink-0 ml-2" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface-elevated border border-white/10 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                className="w-full bg-black/20 border border-white/5 rounded-md pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
                placeholder="Search equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-text-muted text-center">No matches found.</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    opt.available_quantity === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-white/5'
                  } ${value === opt.id ? 'bg-primary/10 text-primary' : 'text-white'}`}
                  onClick={() => {
                    if (opt.available_quantity > 0) {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearch("");
                    }
                  }}
                >
                  <span className="truncate">{opt.name}</span>
                  <span className="text-xs shrink-0 ml-2 font-medium bg-black/40 px-2 py-0.5 rounded text-text-muted">
                    Avail: {opt.available_quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  
  const toggleExpand = (id) => setExpandedItems(prev => ({...prev, [id]: !prev[id]}));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issueForm, setIssueForm] = useState({
    name: "",
    roll_number: "",
    equipment_id: "",
    issue_quantity: 1,
    issue_date: new Date().toISOString().split('T')[0],
    from_time: "",
    till_time: ""
  });

  const fetchData = async () => {
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
    fetchData();
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      return matchesSearch && matchesCategory;
    });
  }, [equipmentList, searchQuery, selectedCategories]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.equipment_id) {
      toast.error("Please select equipment to issue");
      return;
    }

    const selectedEq = equipmentList.find(e => e.id === issueForm.equipment_id);
    if (issueForm.issue_quantity > (selectedEq?.available_quantity || 0)) {
      toast.error(`Cannot issue more than available (${selectedEq?.available_quantity})`);
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/equipment/issue", issueForm);
      toast.success("Equipment issued successfully!");
      setIsModalOpen(false);
      setIssueForm({
        name: "",
        roll_number: "",
        equipment_id: "",
        issue_quantity: 1,
        issue_date: new Date().toISOString().split('T')[0],
        from_time: "",
        till_time: ""
      });
      // Refresh the equipment list to get updated available quantities
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err) || "Failed to issue equipment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({
      ...prev,
      [name]: name === "issue_quantity" ? parseInt(value) || 1 : value
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 relative overflow-hidden rounded-3xl glass border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <Archive className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.4)] mb-2" />
        <h1 className="text-4xl md:text-6xl font-heading text-white font-extrabold tracking-tight relative z-10 drop-shadow-md">
          Equipment Inventory
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl font-light relative z-10 px-4">
          Browse the collection of athletics equipment available for club members.
        </p>
      </div>

      {/* Filters, Search & Action */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input 
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 flex-1 md:justify-center">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mr-1 md:mr-2">
            <Filter className="w-4 h-4 hidden sm:block" />
          </div>
          <button
            onClick={() => setSelectedCategories([])}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              selectedCategories.length === 0 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-surface-elevated text-text-muted border-white/10 hover:border-white/20'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedCategories.includes(cat)
                  ? 'bg-primary/20 text-primary border-primary/50' 
                  : 'bg-surface-elevated text-text-muted border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="w-full md:w-auto gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Issue Equipment
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-4 glass rounded-2xl p-4 border border-white/5">
              <Skeleton className="w-full h-48 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-1/3 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="py-12">
          <EmptyState 
            icon={Archive} 
            title="No equipment found" 
            description="We couldn't find any equipment matching your current filters." 
          />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredEquipment.map(item => {
              const avail = item.available_quantity ?? item.quantity;
              return (
                <motion.div 
                  key={item.id}
                  variants={itemVariants}
                  layout
                  className="group flex flex-col glass rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-colors shadow-lg"
                >
                  {/* Image Area */}
                  <div className="relative w-full overflow-hidden bg-black/40 flex items-center justify-center">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        width={item.image_width}
                        height={item.image_height}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-white/20">
                        <Archive className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xl">
                        <div className={`w-2 h-2 rounded-full ${avail > 0 ? 'bg-success' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold text-white">Avail: {avail}</span>
                      </div>
                      <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">
                        <span className="text-[10px] font-medium text-white/70">Total: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1 block">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <div className="mt-auto pt-2">
                        <p className={`text-sm text-text-muted transition-all duration-300 ${expandedItems[item.id] ? '' : 'line-clamp-3'}`}>
                          {item.description}
                        </p>
                        {item.description.length > 100 && (
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpand(item.id); }}
                            className="text-[10px] text-primary mt-2 uppercase tracking-wider font-bold hover:text-white transition-colors"
                          >
                            {expandedItems[item.id] ? "Show Less" : "Read More"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Issue Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Equipment">
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted">Equipment *</label>
            <SearchableEquipmentSelect 
              options={equipmentList}
              value={issueForm.equipment_id}
              onChange={(val) => setIssueForm(prev => ({...prev, equipment_id: val}))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted">Name *</label>
            <Input 
              name="name"
              value={issueForm.name}
              onChange={handleFormChange}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted">Roll Number *</label>
            <Input 
              name="roll_number"
              value={issueForm.roll_number}
              onChange={handleFormChange}
              placeholder="e.g. 23MS123"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-muted">Date *</label>
              <Input 
                type="date"
                name="issue_date"
                value={issueForm.issue_date}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-muted">Quantity *</label>
              <Input 
                type="number"
                name="issue_quantity"
                value={issueForm.issue_quantity}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-muted">From Time *</label>
              <Input 
                type="time"
                name="from_time"
                value={issueForm.from_time}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-muted">Till Time *</label>
              <Input 
                type="time"
                name="till_time"
                value={issueForm.till_time}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="surface" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? "Submitting..." : "Issue Now"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
