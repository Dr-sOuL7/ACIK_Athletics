import { useEffect, useState } from "react";

import API from "../api/axios";

export default function EditHomepage() {

  const [formData, setFormData] =
    useState({

      title: "",
      subtitle: "",
      announcement: "",
    });

  useEffect(() => {

    async function fetchData() {

      const res =
        await API.get(
          "/homepage"
        );

      setFormData(res.data);
    }

    fetchData();

  }, []);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        await API.put(
          "/homepage",
          formData
        );

        alert(
          "Homepage updated"
        );

      } catch (err) {

        console.log(err);
      }
    };

  return (

    <form
      onSubmit={handleSubmit}

      className="
        flex
        flex-col
        gap-4
        max-w-xl
      "
    >

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <input
        name="subtitle"
        value={formData.subtitle}
        onChange={handleChange}
        placeholder="Subtitle"

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <textarea
        name="announcement"
        value={formData.announcement}
        onChange={handleChange}
        placeholder="Announcement"

        className="
          p-3
          bg-slate-800
          rounded-lg
          h-40
        "
      />

      <button
        className="
          bg-yellow-400
          text-black
          p-3
          rounded-lg
          font-bold
        "
      >
        Update Homepage
      </button>

    </form>
  );
}