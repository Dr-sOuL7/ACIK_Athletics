import { useEffect, useState } from "react";

import API from "../api/axios";

export default function Events() {

  const [events, setEvents] =
    useState([]);

  useEffect(() => {

    async function fetchEvents() {

      try {

        const res =
          await API.get(
            "/results/events"
          );

        setEvents(res.data);

      } catch (err) {

        console.log(err);
      }
    }

    fetchEvents();

  }, []);

  return (

    <div>

      <h1
        className="
          text-5xl
          text-yellow-400
          mb-8
        "
      >
        Events & Schedule
      </h1>

      <div className="space-y-6">

        {events.map((event) => (

          <div
            key={event.id}

            className="
              bg-slate-800
              p-6
              rounded-2xl
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                mb-3
              "
            >
              {event.title}
            </h2>

            <p>
              {event.description}
            </p>

            <p className="mt-3">
              Location:
              {" "}
              {event.location}
            </p>

            <p>
              Date:
              {" "}
              {event.event_date}
            </p>

            <p>
              Time:
              {" "}
              {event.event_time}
            </p>

            <p>
              Category:
              {" "}
              {event.category}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}