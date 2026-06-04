import { useState, useCallback } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { processImage, formatFileSize } from "../utils/imageProcessor";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2, ImagePlus, CheckCircle2, AlertCircle, X, Link as LinkIcon, Download } from "lucide-react";
import { Button } from "../components/ui/Button";

const TOURNAMENTS = [
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS",
];

const CATEGORIES = ["Track Events", "Field Events", "Relay Events", "Others"];

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export default function AddPhotoForm({ refresh }) {
  // processedFiles now stores: { file, width, height, originalSize, processedSize, originalName, caption }
  const [processedFiles, setProcessedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ done: 0, total: 0 });
  const [tournament, setTournament] = useState("IISM");
  const [category, setCategory] = useState("Track Events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [driveUrl, setDriveUrl] = useState("");
  const [importing, setImporting] = useState(false);

  // Helper to process a raw File object and add it to state
  const processAndAddFile = async (rawFile, defaultCaption = "") => {
    try {
      const processed = await processImage(rawFile);
      setProcessedFiles(prev => [...prev, {
        ...processed,
        originalName: rawFile.name,
        caption: defaultCaption
      }]);
      return true;
    } catch (err) {
      setError(`Error processing "${rawFile.name}": ${getErrorMessage(err)}`);
      return false;
    }
  };

  const handleFilesSelected = useCallback(async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setProcessing(true);
    setError(null);
    setProcessingProgress({ done: 0, total: selected.length });

    for (let i = 0; i < selected.length; i++) {
      await processAndAddFile(selected[i]);
      setProcessingProgress({ done: i + 1, total: selected.length });
    }

    setProcessing(false);
    e.target.value = null;
  }, []);

  const handleDriveImport = async (e) => {
    e.preventDefault();
    if (!driveUrl) return;

    setImporting(true);
    setError(null);

    try {
      const res = await API.post("/gallery/import", { driveUrl }, { responseType: 'blob' });
      const blob = res.data;
      
      // Attempt to guess filename from headers if possible, otherwise use a generic name
      let filename = "gdrive_import.jpg";
      const disposition = res.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }

      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      
      setProcessing(true);
      setProcessingProgress({ done: 0, total: 1 });
      await processAndAddFile(file);
      setProcessingProgress({ done: 1, total: 1 });
      setDriveUrl("");
    } catch (err) {
      console.error(err);
      setError("Failed to import from Google Drive: " + getErrorMessage(err));
    } finally {
      setImporting(false);
      setProcessing(false);
    }
  };

  const removeFile = (index) => {
    setProcessedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index, newCaption) => {
    setProcessedFiles((prev) => {
      const copy = [...prev];
      copy[index].caption = newCaption;
      return copy;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (processedFiles.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadPromises = processedFiles.map(async (item) => {
        const uniqueName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
        // Store in a folder named after the tournament
        const filePath = `${tournament}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery_images")
          .upload(filePath, item.file, { contentType: "image/webp" });

        if (uploadError) throw new Error(`Upload failed for "${item.originalName}": ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("gallery_images")
          .getPublicUrl(filePath);

        await API.post("/gallery", {
          image_url: publicUrl,
          tournament,
          category,
          caption: item.caption || undefined,
          width: item.width,
          height: item.height,
        });
      });

      await Promise.all(uploadPromises);

      setProcessedFiles([]);
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to upload photos: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const totalOriginalSize = processedFiles.reduce((s, f) => s + f.originalSize, 0);
  const totalProcessedSize = processedFiles.reduce((s, f) => s + f.processedSize, 0);
  const savedPct = totalOriginalSize > 0
    ? Math.round((1 - totalProcessedSize / totalOriginalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="whitespace-pre-wrap">{error}</span>
        </div>
      )}

      {/* Upload Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Upload from Device <span className="text-white/40 text-xs font-normal">(JPG, PNG, WebP)</span>
          </label>
          <label
            htmlFor="photo-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${processing
                ? "border-primary/50 bg-primary/5 pointer-events-none"
                : "border-white/10 bg-surface-elevated hover:bg-surface-hover hover:border-primary/40"
              }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {processing ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                  <p className="text-sm text-primary font-medium">
                    Converting {processingProgress.done}/{processingProgress.total}…
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm text-text-muted">
                    <span className="font-semibold text-white">Click</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-text-muted mt-1 leading-tight">Converted to WebP · Max 1920px</p>
                </>
              )}
            </div>
            <input
              id="photo-upload"
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              disabled={loading || processing}
            />
          </label>
        </div>

        {/* GDrive Import */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Import from Google Drive
          </label>
          <form onSubmit={handleDriveImport} className="flex flex-col h-32 justify-between bg-surface-elevated border border-white/10 rounded-xl p-3">
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="url"
                  placeholder="Paste share link here..."
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
              <p className="text-[10px] text-text-muted">Link must be set to "Anyone with the link".</p>
            </div>
            <Button type="submit" variant="secondary" className="w-full text-xs py-2 h-auto" disabled={importing || processing || !driveUrl}>
              {importing ? <><Loader2 className="w-3 h-3 animate-spin mr-1.5"/> Fetching...</> : <><Download className="w-3 h-3 mr-1.5"/> Import Image</>}
            </Button>
          </form>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        
        {/* Global Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Tournament</label>
            <select
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            >
              {TOURNAMENTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Event Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Processed Files & Per-Image Captions */}
        {processedFiles.length > 0 && (
          <div className="space-y-3 bg-surface-elevated/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-xs text-text-muted border-b border-white/5 pb-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>
                {processedFiles.length} photos ready ·{" "}
                <span className="text-white/80">{formatFileSize(totalOriginalSize)}</span>
                {" → "}
                <span className="text-green-400 font-semibold">{formatFileSize(totalProcessedSize)}</span>
                {" "}
                <span className="text-green-400">({savedPct}% smaller)</span>
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {processedFiles.map((item, i) => {
                const pct = Math.round((1 - item.processedSize / item.originalSize) * 100);
                return (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                         <img src={URL.createObjectURL(item.file)} alt="preview" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/90 text-xs truncate max-w-[150px]" title={item.originalName}>
                          {item.originalName.replace(/\.[^/.]+$/, "")}.webp
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {formatFileSize(item.processedSize)} <span className="text-green-400/80">({pct}%)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <input 
                        type="text" 
                        placeholder="Caption (Optional)" 
                        value={item.caption}
                        onChange={(e) => updateCaption(i, e.target.value)}
                        className="bg-black/20 border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 w-full sm:w-40"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center"
          disabled={loading || processing || processedFiles.length === 0}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          {loading
            ? `Uploading ${processedFiles.length} photo${processedFiles.length > 1 ? "s" : ""}…`
            : `Upload ${processedFiles.length > 0 ? processedFiles.length + " WebP Photo" + (processedFiles.length > 1 ? "s" : "") : "Photo"}`
          }
        </Button>
      </form>
    </div>
  );
}
