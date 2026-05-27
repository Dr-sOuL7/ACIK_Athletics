import { useEffect, useState }
from "react";

import API from "../api/axios";

export default function Rankings() {

  const [rankings, setRankings] =
    useState([]);

  const [selectedEvent,
    setSelectedEvent] =
    useState("All");

  useEffect(() => {

    async function fetchRankings() {

      try {

        const res =
          await API.get(
            "/results/rankings"
          );

        setRankings(res.data);

      } catch (err) {

        console.log(err);
      }
    }

    fetchRankings();

  }, []);

  const uniqueEvents = [

    "All",

    ...new Set(

      rankings.map(
        (item) => item.event_name
      )
    ),
  ];

  const filteredRankings =

    selectedEvent === "All"

      ? rankings

      : rankings.filter(

          (item) =>

            item.event_name ===
            selectedEvent
        );

  return (

    <div className="p-6 md:p-10">

      <h1
        className="
          text-4xl
          md:text-5xl

          text-yellow-400

          mb-8
        "
      >
        Rankings
      </h1>

      {/* FILTER */}

      <div className="mb-8">

        <select

          value={selectedEvent}

          onChange={(e) =>
            setSelectedEvent(
              e.target.value
            )
          }

          className="
            bg-slate-800
            p-3
            rounded-xl
          "
        >

          {uniqueEvents.map((event) => (

            <option
              key={event}
              value={event}
            >
              {event}
            </option>

          ))}

        </select>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table
          className="
            w-full

            bg-slate-800

            rounded-2xl

            overflow-hidden
          "
        >

          <thead
            className="
              bg-slate-700
            "
          >

            <tr>

              <th className="p-4">
                Rank
              </th>

              <th className="p-4">
                Athlete
              </th>

              <th className="p-4">
                Event
              </th>

              <th className="p-4">
                🥇
              </th>

              <th className="p-4">
                🥈
              </th>

              <th className="p-4">
                🥉
              </th>

              <th className="p-4">
                Points
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredRankings.map((item) => (

              <tr
                key={item.id}

                className="
                  border-b
                  border-slate-700
                "
              >

                <td className="p-4">
                  {item.ranking_position}
                </td>

                <td className="p-4">
                  {item.athlete_name}
                </td>

                <td className="p-4">
                  {item.event_name}
                </td>

                <td className="p-4">
                  {item.gold_medals}
                </td>

                <td className="p-4">
                  {item.silver_medals}
                </td>

                <td className="p-4">
                  {item.bronze_medals}
                </td>

                <td className="p-4">
                  {item.total_points}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}