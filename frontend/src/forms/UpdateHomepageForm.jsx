import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/errorHelper";
import { supabase } from "../api/supabase";
import API from "../api/axios";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";

export default function UpdateHomepageForm() {
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetchCurrentBranding = async () => {
      try {
        const res = await API.get("/homepage");
        setCurrentData(res.data);
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      }
    };
    fetchCurrentBranding();
  }, []);

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("homepage_assets")
      .upload(filePath, file);

    if (uploadError) throw new Error("Upload failed: " + uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from("homepage_assets")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile && !logoFile) {
      alert("Please select at least one file to upload.");
      return;
    }
    
    setLoading(true);
    try {
      let banner_url = undefined;
      let logo_url = undefined;

      if (bannerFile) {
        banner_url = await uploadFile(bannerFile);
      }
      
      if (logoFile) {
        logo_url = await uploadFile(logoFile);
      }

      await API.put("/homepage", {
        ...(banner_url && { banner_url }),
        ...(logo_url && { logo_url })
      });
      
      alert("Homepage branding updated successfully!");
      setBannerFile(null);
      setLogoFile(null);
      
      // Refresh current data
      const res = await API.get("/homepage");
      setCurrentData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to update branding: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearBranding = async (type) => {
    if (!window.confirm(`Are you sure you want to remove the current ${type}?`)) return;
    try {
      setLoading(true);
      await API.put("/homepage", {
        [type === 'banner' ? 'banner_url' : 'logo_url']: null
      });
      const res = await API.get("/homepage");
      setCurrentData(res.data);
      alert(`${type} removed successfully.`);
    } catch (err) {
      console.error(err);
      alert(`Failed to remove ${type}: ` + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Banner Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-muted">Banner Image (Ultra-wide)</label>
              {currentData?.banner_url && (
                <button type="button" onClick={() => clearBranding('banner')} className="text-xs text-red-400 hover:text-red-300">Remove Current</button>
              )}
            </div>
            {currentData?.banner_url && !bannerFile && (
               <div className="mb-2 h-20 w-full rounded-lg overflow-hidden border border-white/10">
                 <img src={currentData.banner_url} alt="Current Banner" className="w-full h-full object-cover" />
               </div>
            )}
            {bannerFile ? (
              <div className="flex items-center justify-between bg-surface-elevated border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-white text-sm truncate">{bannerFile.name}</span>
                </div>
                <button type="button" onClick={() => setBannerFile(null)} className="text-text-muted hover:text-red-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-6 h-6 mb-1 text-primary" />
                  <p className="text-xs text-text-muted"><span className="text-white font-medium">Click to upload new banner</span> (1920x400 recommended)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files[0])} disabled={loading} />
              </label>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-muted">Center Logo</label>
              {currentData?.logo_url && (
                <button type="button" onClick={() => clearBranding('logo')} className="text-xs text-red-400 hover:text-red-300">Remove Current</button>
              )}
            </div>
            {currentData?.logo_url && !logoFile && (
               <div className="mb-2 h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-white flex items-center justify-center">
                 <img src={currentData.logo_url} alt="Current Logo" className="w-16 h-16 object-contain" />
               </div>
            )}
            {logoFile ? (
              <div className="flex items-center justify-between bg-surface-elevated border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-white text-sm truncate">{logoFile.name}</span>
                </div>
                <button type="button" onClick={() => setLogoFile(null)} className="text-text-muted hover:text-red-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-surface-elevated hover:bg-surface-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-6 h-6 mb-1 text-primary" />
                  <p className="text-xs text-text-muted"><span className="text-white font-medium">Click to upload new logo</span> (Square, transparent PNG recommended)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files[0])} disabled={loading} />
              </label>
            )}
          </div>

          <Button type="submit" disabled={loading || (!bannerFile && !logoFile)} className="mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : "Update Branding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
