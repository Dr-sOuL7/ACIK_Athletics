import { useState }
from "react";

import API from "../api/axios";

export default function AddEventForm() {

  const [formData, setFormData] =
    useState({

      title: "",
      description: "",
      location: "",
      event_date: "",
      event_time: "",
      category: "",
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
          "/events",
          formData
        );

        alert("Event created");

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
        placeholder="Event Title"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <input
        type="date"
        name="event_date"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <input
        name="event_time"
        placeholder="Time"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
        "
      />

      <input
        name="category"
        placeholder="Category"
        onChange={handleChange}

        className="
          p-3
          bg-slate-800
          rounded-lg
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
        Create Event
      </button>

    </form>
  );
}