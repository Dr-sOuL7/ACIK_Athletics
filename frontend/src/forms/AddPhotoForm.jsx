import { useState, useCallback } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { processImage, formatFileSize } from "../utils/imageProcessor";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { UploadCloud, Loader2, ImagePlus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "../components/ui/Button";

const categories = [
  "IISM",
  "PRATAP",
  "FREEDOM RUN",
  "GANRAJYAM PRIDE RUN",
  "FRESHERS",
  "INTERBATCH",
  "OTHERS",
];

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export default function AddPhotoForm({ refresh }) {
  const [processedFiles, setProcessedFiles] = useState([]); // { file, width, height, originalSize, processedSize, name }
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ done: 0, total: 0 });
  const [category, setCategory] = useState("IISM");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = useCallback(async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setProcessing(true);
    setError(null);
    setProcessedFiles([]);
    setProcessingProgress({ done: 0, total: selected.length });

    const results = [];

    for (const rawFile of selected) {
      try {
        const processed = await processImage(rawFile);
        results.push({
          ...processed,
          originalName: rawFile.name,
        });
      } catch (err) {
        setError(`Error processing "${rawFile.name}": ${getErrorMessage(err)}`);
        setProcessing(false);
        setProcessedFiles([]);
        e.target.value = null;
        return;
      }
      setProcessingProgress({ done: results.length, total: selected.length });
    }

    setProcessedFiles(results);
    setProcessing(false);
    // Reset the input so the same files can be re-selected if needed
    e.target.value = null;
  }, []);

  const removeFile = (index) => {
    setProcessedFiles((prev) => prev.filter((_, i) => i !== index));
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
        const filePath = `${category}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery_images")
          .upload(filePath, item.file, { contentType: "image/webp" });

        if (uploadError) throw new Error(`Upload failed for "${item.originalName}": ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("gallery_images")
          .getPublicUrl(filePath);

        await API.post("/gallery", {
          image_url: publicUrl,
          category,
          caption: caption || undefined,
          width: item.width,
          height: item.height,
        });
      });

      await Promise.all(uploadPromises);

      setProcessedFiles([]);
      setCaption("");
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
    <form onSubmit={handleUpload} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="whitespace-pre-wrap">{error}</span>
        </div>
      )}

      {/* Drop zone */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Select Photos <span className="text-white/40 text-xs font-normal">(JPG, PNG, WebP)</span>
        </label>
        <label
          htmlFor="photo-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${processing
              ? "border-primary/50 bg-primary/5 pointer-events-none"
              : "border-white/10 bg-surface-elevated hover:bg-surface-hover hover:border-primary/40"
            }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {processing ? (
              <>
                <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                <p className="text-sm text-primary font-medium">
                  Converting {processingProgress.done}/{processingProgress.total}…
                </p>
                <p className="text-xs text-text-muted mt-1">Optimizing to WebP</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-text-muted">
                  <span className="font-semibold text-white">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-text-muted mt-1">Automatically converted to WebP · Max 1920px</p>
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

      {/* Processed file chips */}
      {processedFiles.length > 0 && (
        <div className="space-y-2">
          {/* Summary savings bar */}
          {processedFiles.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-text-muted pb-1">
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
          )}

          <div className="flex flex-wrap gap-2">
            {processedFiles.map((item, i) => {
              const pct = Math.round((1 - item.processedSize / item.originalSize) * 100);
              return (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <div className="leading-tight">
                    <p className="text-white/80 truncate max-w-[130px]" title={item.originalName}>
                      {item.originalName.replace(/\.[^/.]+$/, "")}.webp
                    </p>
                    <p className="text-text-muted">
                      {formatFileSize(item.originalSize)} → <span className="text-green-400">{formatFileSize(item.processedSize)}</span>
                      <span className="text-white/30 ml-1">({pct}% saved)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-white/30 hover:text-red-400 transition-colors ml-1"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
          required
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Caption <span className="text-white/30 text-xs">(Optional)</span></label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. 100m Sprint Finals"
          className="w-full bg-surface-elevated border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
        />
      </div>

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
  );
}
