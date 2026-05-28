/* eslint-disable */
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import API from "../api/axios";
import { supabase } from "../api/supabase";
import { UploadCloud, Trash2, Loader2, FileSpreadsheet, Plus, Save, Table as TableIcon, Edit, X, Check, Filter } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const EVENT_CATEGORIES = {
  "Track": ["100 m", "200 m", "400 m", "800 m", "1500 m", "3k m", "5k m", "10k m"],
  "Field": ["Long Jump", "Triple Jump", "Discus Throw", "Javelin Throw", "Shotput Throw"],
  "Relay": ["4 x 100 m", "4 x 400 m", "Medley", "Mixed Relay 4 x 100 m", "Mixed Relay 4 x 400 m"]
};

const PREDEFINED_TOURNAMENTS = [
  "PRATAP",
  "IISM",
  "GANRAJYAM PRIDE RUN",
  "FREEDOM RUN",
  "FRESHERS",
  "INTER BATCH"
];

const PREDEFINED_YEARS = ["27", "26", "25", "24", "23"];

const formatTitleCase = (str) => {
  if (!str) return "";
  return str.split(/\s+/).map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "").join(' ').trim();
};

const formatEvent = (str) => {
  if (!str) return "";
  const cleanInput = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const predefined = Object.values(EVENT_CATEGORIES).flat();
  for (const ev of predefined) {
    if (ev.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput) {
      return ev;
    }
  }
  return formatTitleCase(str);
};

const formatYearString = (str) => {
  if (!str) return "";
  const match = str.match(/\d{2,4}/);
  if (match) {
    return match[0].slice(-2);
  }
  return str.trim();
};

export default function ManageRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingFormData, setEditingFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    roll_number: "",
    batch: "",
    gender: "",
    event: "",
    tournament: "",
    place: "",
    year: ""
  });

  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const emptyRow = { name: "", roll_number: "", batch: "", gender: "Male", event: "100 m", tournament_select: "PRATAP", tournament_other: "", record: "", place: "", year: "24", profile_pic: "" };
  const [manualRecords, setManualRecords] = useState([{ ...emptyRow }]);
  const [submittingManual, setSubmittingManual] = useState(false);

  const handleUploadPic = async (file, setUrlCallback) => {
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("gallery_images").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("gallery_images").getPublicUrl(filePath);
      setUrlCallback(publicUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }
  };

  const handleDirectPicUpload = async (record, file) => {
    handleUploadPic(file, async (url) => {
      try {
        const { id, created_at, ...rest } = record;
        const dataToSave = { ...rest, profile_pic: url };
        await API.put(`/records?id=${id}`, dataToSave);
        fetchRecords();
      } catch (err) {
        alert("Failed to save picture.");
      }
    });
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get("/records");
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    return (
      (!filters.name || (r.name && String(r.name).toLowerCase().includes(filters.name.toLowerCase()))) &&
      (!filters.roll_number || (r.roll_number && String(r.roll_number).toLowerCase().includes(filters.roll_number.toLowerCase()))) &&
      (!filters.batch || (r.batch && String(r.batch).toLowerCase().includes(filters.batch.toLowerCase()))) &&
      (!filters.gender || (r.gender && String(r.gender).toLowerCase() === filters.gender.toLowerCase())) &&
      (!filters.event || (r.event && String(r.event).toLowerCase().includes(filters.event.toLowerCase()))) &&
      (!filters.tournament || (r.tournament && String(r.tournament).toLowerCase().includes(filters.tournament.toLowerCase()))) &&
      (!filters.place || (r.place && String(r.place).toLowerCase().includes(filters.place.toLowerCase()))) &&
      (!filters.year || (r.year && String(r.year) === String(filters.year)))
    );
  });

  const handleAddRow = () => {
    setManualRecords([...manualRecords, { ...emptyRow }]);
  };

  const handleRemoveRow = (index) => {
    if (manualRecords.length === 1) return;
    setManualRecords(manualRecords.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...manualRecords];
    updated[index][field] = value;
    setManualRecords(updated);
  };

  const handleManualSubmit = async () => {
    const validRecords = manualRecords
      .filter(row => 
        row.name.trim() !== "" || 
        row.roll_number.trim() !== "" ||
        row.batch.trim() !== "" ||
        row.place.trim() !== "" ||
        row.year.trim() !== "" ||
        row.year.trim() !== "" ||
        row.record.trim() !== "" ||
        (row.tournament_select === "Other" && row.tournament_other.trim() !== "")
      )
      .map(row => {
        const { tournament_select, tournament_other, ...rest } = row;
        return {
          ...rest,
          name: formatTitleCase(row.name),
          roll_number: row.roll_number?.toUpperCase(),
          batch: row.batch?.toUpperCase(),
          place: row.place?.toUpperCase(),
          tournament: (tournament_select === "Other" ? tournament_other.trim() : tournament_select).toUpperCase()
        };
      });

    if (validRecords.length === 0) {
      setError("Please fill in at least one field in a row to save.");
      return;
    }

    setSubmittingManual(true);
    setError(null);
    try {
      await API.post("/records?action=bulk", validRecords);
      alert("Manual records saved successfully.");
      setManualRecords([{ ...emptyRow }]);
      fetchRecords();
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "Failed to save records.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      // Ensure the read works for CSV, TSV, XLSX
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const results = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!results || results.length === 0) {
        throw new Error("The file appears to be empty or could not be parsed.");
      }

      const parsedData = [];
      const validationErrors = [];

      results.forEach((row, idx) => {
        // Make keys case-insensitive and trim whitespace
        const lowerRow = {};
        for (const key in row) {
          lowerRow[key.toLowerCase().trim()] = row[key];
        }

        const parsedRow = {
          name: formatTitleCase(lowerRow["name"]?.toString().trim() || ""),
          roll_number: (lowerRow["roll number"]?.toString().trim() || lowerRow["roll_number"]?.toString().trim() || lowerRow["roll"]?.toString().trim() || "").toUpperCase(),
          batch: (lowerRow["batch"]?.toString().trim() || "").toUpperCase(),
          place: (lowerRow["venue"]?.toString().trim() || lowerRow["place"]?.toString().trim() || lowerRow["position"]?.toString().trim() || "").toUpperCase(),
          year: formatYearString(lowerRow["year"]?.toString().trim() || lowerRow["date"]?.toString().trim() || ""),
          tournament: (lowerRow["tournament"]?.toString().trim() || lowerRow["event name"]?.toString().trim() || "").toUpperCase(),
          event: formatEvent(lowerRow["event"]?.toString().trim() || lowerRow["category"]?.toString().trim() || ""),
          gender: formatTitleCase(lowerRow["gender"]?.toString().trim() || lowerRow["sex"]?.toString().trim() || ""),
          record: lowerRow["record"]?.toString().trim() || lowerRow["timing/distance"]?.toString().trim() || lowerRow["time"]?.toString().trim() || "",
          profile_pic: lowerRow["profile pic"]?.toString().trim() || lowerRow["profile_pic"]?.toString().trim() || ""
        };

        // Check if row is completely empty
        const isRowEmpty = Object.values(parsedRow).every(val => val === "");
        if (isRowEmpty) return;

        // Custom validations to ensure exact issue reporting
        if (parsedRow.batch && parsedRow.batch.length > 4) {
          validationErrors.push(`Row ${idx + 2} (Name: ${parsedRow.name || 'Unknown'}): Batch '${parsedRow.batch}' exceeds 4 characters.`);
        }

        parsedData.push(parsedRow);
      });

      if (parsedData.length === 0) {
        throw new Error("No valid data rows found. Please ensure your file has columns like 'Name', 'Roll Number', 'Event', etc.");
      }

      if (validationErrors.length > 0) {
        throw new Error(`Please fix the following issues before uploading:\n${validationErrors.join('\n')}`);
      }

      await API.post("/records?action=bulk", parsedData);
      alert(`${parsedData.length} records uploaded successfully.`);
      fetchRecords();
    } catch (err) {
      console.error(err);
      let errorMsg = "Failed to upload bulk records.";
      if (err.response?.data?.error) {
        errorMsg = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : JSON.stringify(err.response.data.error, null, 2);
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/records?id=${id}`);
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRecords.size} selected records?`)) return;
    
    setDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedRecords).map(id => API.delete(`/records?id=${id}`)));
      setSelectedRecords(new Set());
      fetchRecords();
      alert(`Successfully deleted ${selectedRecords.size} records.`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete some records.");
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = new Set(filteredRecords.map(r => r.id));
      setSelectedRecords(newSelected);
    } else {
      setSelectedRecords(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const handleEditClick = (record) => {
    setEditingRecordId(record.id);
    setEditingFormData({
      ...record,
      tournament_select: PREDEFINED_TOURNAMENTS.includes(record.tournament) ? record.tournament : (record.tournament ? "Other" : ""),
      tournament_other: PREDEFINED_TOURNAMENTS.includes(record.tournament) ? "" : record.tournament || ""
    });
  };

  const handleEditChange = (field, value) => {
    setEditingFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditingFormData({});
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { tournament_select, tournament_other, ...rest } = editingFormData;
      const dataToSave = {
        ...rest,
        name: formatTitleCase(rest.name),
        roll_number: rest.roll_number?.toUpperCase(),
        batch: rest.batch?.toUpperCase(),
        place: rest.place?.toUpperCase(),
        tournament: (tournament_select === "Other" ? tournament_other.trim() : tournament_select).toUpperCase()
      };
      
      await API.put(`/records?id=${editingRecordId}`, dataToSave);
      setEditingRecordId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to save record.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading text-primary font-bold">
            Manage All-Time Records
          </h1>
          <p className="text-text-muted mt-2">Upload and manage historical athletics records.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
          {error}
        </div>
      )}

      {/* MANUAL BULK ENTRY SECTION */}
      <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TableIcon className="w-6 h-6 text-primary" />
          Manual Bulk Entry
        </h2>
        <p className="text-text-muted text-sm">
          Quickly enter multiple records directly here. You can add as many rows as you need before saving.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-white/10 text-text-muted text-xs uppercase tracking-wider">
                <th className="p-2 w-[15%]">Name</th>
                <th className="p-2 w-[10%]">Roll No.</th>
                <th className="p-2 w-[8%]">Batch</th>
                <th className="p-2 w-[10%]">Gender</th>
                <th className="p-2 w-[12%]">Event</th>
                <th className="p-2 w-[12%]">Tournament</th>
                <th className="p-2 w-[10%]">Record</th>
                <th className="p-2 w-[10%]">Venue</th>
                <th className="p-2 w-[8%]">Year</th>
                <th className="p-2 w-[8%]">Profile Pic</th>
                <th className="p-2 w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {manualRecords.map((row, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="p-1"><Input value={row.name} onChange={(e) => handleRowChange(index, "name", e.target.value)} placeholder="Name" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input value={row.roll_number} onChange={(e) => handleRowChange(index, "roll_number", e.target.value)} placeholder="Roll" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input type="text" value={row.batch} onChange={(e) => handleRowChange(index, "batch", e.target.value)} placeholder="24MS" maxLength={4} className="h-8 text-sm w-16 text-center" /></td>
                  <td className="p-1">
                    <select 
                      value={row.gender} 
                      onChange={(e) => handleRowChange(index, "gender", e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </td>
                  <td className="p-1">
                    <select 
                      value={row.event} 
                      onChange={(e) => handleRowChange(index, "event", e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                        <optgroup key={category} label={category} className="bg-surface text-text-muted">
                          {events.map(ev => <option key={ev} value={ev} className="text-white">{ev}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <select 
                      value={row.tournament_select} 
                      onChange={(e) => handleRowChange(index, "tournament_select", e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {PREDEFINED_TOURNAMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="Other">Other...</option>
                    </select>
                    {row.tournament_select === "Other" && (
                      <Input 
                        value={row.tournament_other} 
                        onChange={(e) => handleRowChange(index, "tournament_other", e.target.value)} 
                        placeholder="Specify tournament" 
                        className="h-8 text-sm mt-1" 
                      />
                    )}
                  </td>
                  <td className="p-1"><Input value={row.record} onChange={(e) => handleRowChange(index, "record", e.target.value)} placeholder="10.5s" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input value={row.place} onChange={(e) => handleRowChange(index, "place", e.target.value)} placeholder="Stadium" className="h-8 text-sm" /></td>
                  <td className="p-1">
                    <select 
                      value={row.year} 
                      onChange={(e) => handleRowChange(index, "year", e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">YY</option>
                      {PREDEFINED_YEARS.map(y => <option key={y} value={y}>'{y}</option>)}
                    </select>
                  </td>
                  <td className="p-1">
                    {row.profile_pic ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-400">Uploaded</span>
                        <button type="button" onClick={() => handleRowChange(index, "profile_pic", "")} className="text-red-400 text-xs hover:underline">&times;</button>
                      </div>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="w-[80px] text-[10px] text-text-muted file:bg-surface-elevated file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:cursor-pointer" 
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleUploadPic(e.target.files[0], (url) => handleRowChange(index, "profile_pic", url));
                          }
                        }} 
                      />
                    )}
                  </td>
                  <td className="p-1 text-center">
                    <button 
                      onClick={() => handleRemoveRow(index)}
                      disabled={manualRecords.length === 1}
                      className="text-red-500 hover:text-red-400 p-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button type="button" variant="outline" onClick={handleAddRow} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Row
          </Button>
          <Button type="button" onClick={handleManualSubmit} disabled={submittingManual} className="flex items-center gap-2">
            {submittingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submittingManual ? "Saving..." : "Save All Records"}
          </Button>
        </div>
      </div>

      {/* CSV UPLOAD SECTION */}
      <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-secondary" />
          Bulk Upload via Spreadsheet
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Upload a CSV, TSV, or Excel (.xlsx) file. Columns do not need to be in any specific order and are not case-sensitive. Expected columns: <b>Name, Roll Number, Batch, Gender, Event, Tournament, Record, Venue, Year</b>.
        </p>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-primary" />
              <p className="mb-2 text-sm text-text-muted">
                <span className="font-semibold text-text-main">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-muted">CSV, TSV, or Excel files (.xlsx, .xls)</p>
            </div>
            <input id="dropzone-file" type="file" accept=".csv, .tsv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading and processing...
          </div>
        )}
      </div>

      {/* EXISTING RECORDS LIST */}
      <div className="glass p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Existing Records</h2>
          <div className="flex items-center gap-3">
            {selectedRecords.size > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete} 
                disabled={deletingBulk}
                className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/50"
              >
                {deletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Selected ({selectedRecords.size})
              </Button>
            )}
            <Button variant={showFilters ? "primary" : "outline"} onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-surface-elevated rounded-xl border border-white/5">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Name</label>
              <Input placeholder="Filter by Name" value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Roll</label>
              <Input placeholder="Filter by Roll" value={filters.roll_number} onChange={(e) => setFilters({...filters, roll_number: e.target.value})} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Batch</label>
              <Input placeholder="Filter by Batch" value={filters.batch} onChange={(e) => setFilters({...filters, batch: e.target.value})} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Gender</label>
              <select 
                className="w-full h-9 px-3 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                value={filters.gender} 
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
              >
                <option value="">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Event</label>
              <select 
                className="w-full h-9 px-3 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                value={filters.event} 
                onChange={(e) => setFilters({...filters, event: e.target.value})}
              >
                <option value="">Any Event</option>
                {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                  <optgroup key={category} label={category} className="bg-surface text-text-muted">
                    {events.map(ev => <option key={ev} value={ev} className="text-white">{ev}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Tournament</label>
              <select 
                className="w-full h-9 px-3 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                value={filters.tournament} 
                onChange={(e) => setFilters({...filters, tournament: e.target.value})}
              >
                <option value="">Any Tournament</option>
                {PREDEFINED_TOURNAMENTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Venue</label>
              <Input placeholder="Filter by Venue" value={filters.place} onChange={(e) => setFilters({...filters, place: e.target.value})} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Year</label>
              <select 
                className="w-full h-9 px-3 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                value={filters.year} 
                onChange={(e) => setFilters({...filters, year: e.target.value})}
              >
                <option value="">Any Year</option>
                {PREDEFINED_YEARS.map(y => <option key={y} value={y}>'{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b border-white/10 text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-2 w-[4%] text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/20 bg-surface/50 text-primary focus:ring-primary/50 cursor-pointer"
                      checked={filteredRecords.length > 0 && selectedRecords.size === filteredRecords.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-2 w-[14%]">Name</th>
                  <th className="p-2 w-[8%]">Roll No.</th>
                  <th className="p-2 w-[8%]">Batch</th>
                  <th className="p-2 w-[8%]">Gender</th>
                  <th className="p-2 w-[12%]">Event</th>
                  <th className="p-2 w-[12%]">Tournament</th>
                  <th className="p-2 w-[10%]">Record</th>
                  <th className="p-2 w-[10%]">Venue</th>
                  <th className="p-2 w-[6%]">Year</th>
                  <th className="p-2 w-[4%]">Pic</th>
                  <th className="p-2 w-[8%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="p-6 text-center text-text-muted">No records found matching filters.</td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isEditing = editingRecordId === r.id;
                    const isSelected = selectedRecords.has(r.id);
                    return (
                      <tr key={r.id} className={`border-b border-white/5 hover:bg-surface-elevated/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="p-2 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-white/20 bg-surface/50 text-primary focus:ring-primary/50 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectRow(r.id)}
                          />
                        </td>
                        {isEditing ? (
                          <>
                            <td className="p-1"><Input value={editingFormData.name || ""} onChange={(e) => handleEditChange("name", e.target.value)} className="h-8 text-sm" /></td>
                            <td className="p-1"><Input value={editingFormData.roll_number || ""} onChange={(e) => handleEditChange("roll_number", e.target.value)} className="h-8 text-sm" /></td>
                            <td className="p-1"><Input value={editingFormData.batch || ""} onChange={(e) => handleEditChange("batch", e.target.value)} maxLength={4} className="h-8 text-sm w-16 text-center" /></td>
                            <td className="p-1">
                              <select 
                                value={editingFormData.gender || ""} 
                                onChange={(e) => handleEditChange("gender", e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </td>
                            <td className="p-1">
                              <select 
                                value={editingFormData.event || ""} 
                                onChange={(e) => handleEditChange("event", e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              >
                                {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                                  <optgroup key={category} label={category} className="bg-surface text-text-muted">
                                    {events.map(ev => <option key={ev} value={ev} className="text-white">{ev}</option>)}
                                  </optgroup>
                                ))}
                              </select>
                            </td>
                            <td className="p-1">
                              <select 
                                value={editingFormData.tournament_select || ""} 
                                onChange={(e) => handleEditChange("tournament_select", e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              >
                                {PREDEFINED_TOURNAMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                                <option value="Other">Other...</option>
                              </select>
                              {editingFormData.tournament_select === "Other" && (
                                <Input 
                                  value={editingFormData.tournament_other || ""} 
                                  onChange={(e) => handleEditChange("tournament_other", e.target.value)} 
                                  placeholder="Specify tournament" 
                                  className="h-8 text-sm mt-1" 
                                />
                              )}
                            </td>
                            <td className="p-1"><Input value={editingFormData.record || ""} onChange={(e) => handleEditChange("record", e.target.value)} className="h-8 text-sm" /></td>
                            <td className="p-1"><Input value={editingFormData.place || ""} onChange={(e) => handleEditChange("place", e.target.value)} className="h-8 text-sm" /></td>
                            <td className="p-1">
                              <select 
                                value={editingFormData.year || ""} 
                                onChange={(e) => handleEditChange("year", e.target.value)}
                                className="w-full h-8 px-2 rounded-lg bg-surface border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              >
                                <option value="">YY</option>
                                {PREDEFINED_YEARS.map(y => <option key={y} value={y}>'{y}</option>)}
                              </select>
                            </td>
                            <td className="p-1">
                              {editingFormData.profile_pic ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-green-400">Yes</span>
                                  <button type="button" onClick={() => handleEditChange("profile_pic", "")} className="text-red-400 text-xs hover:underline">&times;</button>
                                </div>
                              ) : (
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="w-[60px] text-[10px] text-text-muted file:bg-surface-elevated file:text-white file:border-0 file:rounded file:px-1 file:py-1 file:cursor-pointer" 
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleUploadPic(e.target.files[0], (url) => handleEditChange("profile_pic", url));
                                    }
                                  }} 
                                />
                              )}
                            </td>
                            <td className="p-1 flex items-center justify-center gap-1 mt-1">
                              <button onClick={handleSaveEdit} disabled={savingEdit} className="text-success hover:text-green-400 p-1.5 rounded hover:bg-green-500/10 transition-colors disabled:opacity-50" title="Save changes">
                                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                              </button>
                              <button onClick={handleCancelEdit} disabled={savingEdit} className="text-text-muted hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-50" title="Cancel">
                                <X className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 text-sm">{r.name}</td>
                            <td className="p-2 text-sm font-mono">{r.roll_number}</td>
                            <td className="p-2 text-sm">{r.batch}</td>
                            <td className="p-2 text-sm">{r.gender}</td>
                            <td className="p-2 font-medium text-primary text-sm">{r.event}</td>
                            <td className="p-2 text-sm">{r.tournament}</td>
                            <td className="p-2 font-mono text-secondary text-sm">{r.record}</td>
                            <td className="p-2 text-sm">{r.place}</td>
                            <td className="p-2 text-sm">{r.year ? `'${r.year}` : ""}</td>
                            <td className="p-2 text-sm text-center">
                              {r.profile_pic ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-green-400 text-xs font-bold">Yes</span>
                                  <button onClick={() => {
                                    if(window.confirm("Remove profile picture?")) {
                                      const { id, created_at, ...rest } = r;
                                      API.put(`/records?id=${id}`, { ...rest, profile_pic: null }).then(fetchRecords);
                                    }
                                  }} className="text-red-400 hover:text-red-300 ml-1">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer text-primary hover:text-primary-hover flex items-center justify-center bg-primary/10 rounded px-2 py-1 transition-colors" title="Upload Profile Pic">
                                  <UploadCloud className="w-4 h-4 mr-1" />
                                  <span className="text-xs font-medium">Upload</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        handleDirectPicUpload(r, e.target.files[0]);
                                      }
                                    }} 
                                  />
                                </label>
                              )}
                            </td>
                            <td className="p-2 flex items-center justify-center gap-1">
                              <button onClick={() => handleEditClick(r)} className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit record">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete record">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
