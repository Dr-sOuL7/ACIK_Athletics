import { useState }
from "react";

import API from "../api/axios";

export default function AddAnnouncementForm() {

  const [formData, setFormData] =
    useState({

      title: "",
      message: "",
    });

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

        await API.post(
          "/results/announcements",
          formData
        );

        alert(
          "Announcement added"
        );

      } catch (err) {

        console.log(err);

        alert("Failed");
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
        placeholder="Announcement Title"

        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <textarea
        name="message"
        placeholder="Announcement Message"

        onChange={handleChange}

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
        Publish Announcement
      </button>

    </form>
  );
}