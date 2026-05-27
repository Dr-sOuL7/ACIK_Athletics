import { useState, useEffect } from "react";
import Papa from "papaparse";
import API from "../api/axios";
import { UploadCloud, Trash2, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function ManageRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data.map(row => ({
            name: row["Name"] || "",
            roll_number: row["Roll Number"] || "",
            batch: row["Batch"] || "",
            place: row["Place"] || "",
            date: row["Date"] || "",
            tournament: row["Tournament"] || "",
            event: row["Event"] || "",
            record: row["Record"] || "",
            iism_record: row["IISM record"] || row["IISM record (if any)"] || ""
          }));

          await API.post("/records/bulk", parsedData);
          alert("Records uploaded successfully (overwriting duplicates).");
          fetchRecords();
        } catch (err) {
          console.error(err);
          setError("Failed to upload bulk records.");
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        setError("Error parsing CSV file.");
        setUploading(false);
      }
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/records/${id}`);
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
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* CSV UPLOAD SECTION */}
      <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-secondary" />
          Bulk Upload via CSV
        </h2>
        <p className="text-text-muted text-sm">
          Upload a CSV file. Expected columns: <b>Name, Roll Number, Batch, Place, Date, Tournament, Event, Record, IISM record</b>.
          If a record with the same Roll Number and Event exists, it will be overwritten.
        </p>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-primary" />
              <p className="mb-2 text-sm text-text-muted">
                <span className="font-semibold text-text-main">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-muted">CSV files only</p>
            </div>
            <input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
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
