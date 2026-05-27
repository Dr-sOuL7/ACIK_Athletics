import { useState }
from "react";

import API from "../api/axios";

export default function EventEditor({

  event,

  refresh,

}) {

  const [formData, setFormData] =
    useState({

      title: event.title,

      description:
        event.description,

      location:
        event.location,

      event_date:
        event.event_date,

      event_time:
        event.event_time,

      category:
        event.category,
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

        await API.put(

          `/events/${event.id}`,

          formData
        );

        alert(
          "Event updated"
        );

        refresh();

      } catch (err) {

        console.log(err);

        alert("Failed");
      }
    };

    const deleteEvent =
  async () => {

    const confirmDelete =
      window.confirm(
        "Delete this event?"
      );

    if (!confirmDelete) {

      return;
    }

    try {

      await API.delete(

        `/events/${event.id}`

      );

      alert(
        "Event deleted"
      );

      refresh();

    } catch (err) {

      console.log(err);

      alert("Failed");
    }
  };

  return (

    <form
      onSubmit={handleSubmit}

      className="
        bg-slate-800
        p-6
        rounded-2xl
        space-y-4
      "
    >

      <h2
        className="
          text-2xl
          text-yellow-400
          font-bold
        "
      >
        Edit Event
      </h2>

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <input
        name="location"
        value={formData.location}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <input
        type="date"
        name="event_date"
        value={formData.event_date}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <input
        name="event_time"
        value={formData.event_time}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <input
        name="category"
        value={formData.category}
        onChange={handleChange}

        className="
          w-full
          p-3
          bg-slate-700
          rounded-lg
        "
      />

      <button
        className="
          bg-yellow-400
          text-black
          px-5
          py-3
          rounded-lg
          font-bold
        "
      >
        Save Changes
      </button>

      <button

  type="button"

  onClick={deleteEvent}

  className="
    bg-red-600
    text-white

    px-5
    py-3

    rounded-lg
    font-bold

    ml-4
  "
>
  Delete Event
</button>

    </form>
  );
}