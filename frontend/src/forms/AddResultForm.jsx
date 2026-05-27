import { useState } from "react";
import API from "../api/axios";
import { supabase } from "../api/supabase";

export default function AddResultForm() {
  const [formData, setFormData] = useState({
    athlete_name: "",
    event_name: "",
    position: "",
    performance: "",
    isBest: false,
  });
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photo_url = "";

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        photo_url = data.publicUrl;
      }

      await API.post("/results", {
        ...formData,
        photo_url
      });

      alert("Result uploaded");
    } catch (err) {
      console.log(err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (

    <form
      onSubmit={handleSubmit}

      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
      }}
    >

      <input
        type="text"
        name="athlete_name"
        placeholder="Athlete Name"
        onChange={handleChange}
      />

      <input
        type="text"
        name="event_name"
        placeholder="Event Name"
        onChange={handleChange}
      />

      <input
        type="number"
        name="position"
        placeholder="Position"
        onChange={handleChange}
      />

      <input
        type="text"
        name="performance"
        placeholder="Performance"
        onChange={handleChange}
      />

      <label>

        Best Athlete

        <input
          type="checkbox"
          name="isBest"
          onChange={handleChange}
        />

      </label>

      <input
        type="file"
        onChange={(e) =>
          setPhoto(e.target.files[0])
        }
      />

      <button type="submit">
        Upload Result
      </button>

    </form>
  );
}