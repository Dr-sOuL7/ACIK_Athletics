/* eslint-disable */
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import API from "../api/axios";
import { UploadCloud, Trash2, Loader2, FileSpreadsheet, Plus, Save, Table as TableIcon } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function ManageRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

  const emptyRow = { name: "", roll_number: "", batch: "", place: "", date: "", tournament_select: "PRATAP", tournament_other: "", event: "100 m", gender: "Male", record: "", iism_record: "" };
  const [manualRecords, setManualRecords] = useState([{ ...emptyRow }]);
  const [submittingManual, setSubmittingManual] = useState(false);

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
        row.date.trim() !== "" ||
        row.record.trim() !== "" ||
        row.iism_record.trim() !== "" ||
        (row.tournament_select === "Other" && row.tournament_other.trim() !== "")
      )
      .map(row => {
        const { tournament_select, tournament_other, ...rest } = row;
        return {
          ...rest,
          tournament: tournament_select === "Other" ? tournament_other.trim() : tournament_select
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
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const results = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const parsedData = results.map(row => ({
        name: row["Name"]?.toString().trim() || "",
        roll_number: row["Roll Number"]?.toString().trim() || "",
        batch: row["Batch"]?.toString().trim() || "",
        place: row["Place"]?.toString().trim() || "",
        date: row["Date"]?.toString().trim() || "",
        tournament: row["Tournament"]?.toString().trim() || "",
        event: row["Event"]?.toString().trim() || "",
        gender: row["Gender"]?.toString().trim() || "",
        record: row["Record"]?.toString().trim() || "",
        iism_record: row["IISM record"]?.toString().trim() || row["IISM record (if any)"]?.toString().trim() || ""
      }));

      await API.post("/records?action=bulk", parsedData);
      alert("Records uploaded successfully.");
      fetchRecords();
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.error;
      if (serverError) {
        setError(serverError);
      } else {
        setError(err.message || "Failed to upload bulk records.");
      }
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading text-primary font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
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
                <th className="p-2 w-[12%]">Event</th>
                <th className="p-2 w-[10%]">Gender</th>
                <th className="p-2 w-[12%]">Tournament</th>
                <th className="p-2 w-[10%]">Record</th>
                <th className="p-2 w-[10%]">Place</th>
                <th className="p-2 w-[8%]">Date</th>
                <th className="p-2 w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {manualRecords.map((row, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="p-1"><Input value={row.name} onChange={(e) => handleRowChange(index, "name", e.target.value)} placeholder="Name" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input value={row.roll_number} onChange={(e) => handleRowChange(index, "roll_number", e.target.value)} placeholder="Roll" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input value={row.batch} onChange={(e) => handleRowChange(index, "batch", e.target.value)} placeholder="Batch" className="h-8 text-sm" /></td>
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
                  <td className="p-1"><Input value={row.place} onChange={(e) => handleRowChange(index, "place", e.target.value)} placeholder="1st" className="h-8 text-sm" /></td>
                  <td className="p-1"><Input type="date" value={row.date} onChange={(e) => handleRowChange(index, "date", e.target.value)} className="h-8 text-sm" /></td>
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
          Bulk Upload via CSV
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Upload a CSV or Excel (.xlsx) file. Expected columns: <b>Name, Roll Number, Batch, Place, Date, Tournament, Event, Gender, Record, IISM record</b>.
        </p>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-primary" />
              <p className="mb-2 text-sm text-text-muted">
                <span className="font-semibold text-text-main">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-muted">CSV or Excel files (.xlsx)</p>
            </div>
            <input id="dropzone-file" type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={uploading} />
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
        <h2 className="text-2xl font-bold mb-6">Existing Records</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                  <th className="p-3">Name (Roll)</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Tournament</th>
                  <th className="p-3">Record</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-text-muted">No records found.</td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-surface-elevated/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-text-muted">{r.roll_number} - {r.batch}</div>
                      </td>
                      <td className="p-3 font-medium text-primary">{r.event}</td>
                      <td className="p-3 text-sm">{r.gender}</td>
                      <td className="p-3 text-sm">{r.tournament}</td>
                      <td className="p-3 font-mono text-secondary">{r.record}</td>
                      <td className="p-3">
                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
