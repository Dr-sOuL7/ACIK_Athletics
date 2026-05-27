import { useEffect, useState }
from "react";

import API from "../api/axios";

import AddEventForm
from "../forms/AddEventForm";

import EventEditor
from "../components/EventEditor";

export default function ManageEvents() {

  const [events, setEvents] =
    useState([]);

  async function fetchEvents() {

    try {

      const res =
        await API.get(
          "/events"
        );

      setEvents(res.data);

    } catch (err) {

      console.log(err);
    }
  }

useEffect(() => {

  async function loadData() {

    await fetchEvents();
  }

  loadData();

}, []);

  return (

    <div className="space-y-8">

      <h1
        className="
          text-5xl
          text-yellow-400
          font-bold
        "
      >
        Manage Events
      </h1>

      <AddEventForm
        refresh={fetchEvents}
      />

      <div className="space-y-6">

        {events.map((event) => (

          <EventEditor

            key={event.id}

            event={event}

            refresh={fetchEvents}

          />

        ))}

      </div>

    </div>
  );
}