import { useEffect, useState }
from "react";

import API from "../api/axios";

import RankingEditor
from "../components/RankingEditor";

import AddRankingForm
from "../forms/AddRankingForm";

export default function ManageRankings() {

  const [rankings, setRankings] =
    useState([]);

  const [selectedEvent,
    setSelectedEvent] =
    useState("All");

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

useEffect(() => {

  async function loadData() {

    await fetchRankings();
  }

  loadData();

}, []);

  async function deleteRanking(id) {

    try {

      await API.delete(
        `/results/rankings/${id}`
      );

      fetchRankings();

    } catch (err) {

      console.log(err);

      alert(
        "Delete failed"
      );
    }
  }

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

    <div className="space-y-10">

      <div>

        <h1
          className="
            text-5xl
            font-bold
            text-yellow-400
            mb-3
          "
        >
          Manage Rankings
        </h1>

        <p
          className="
            text-slate-400
          "
        >
          Add, edit, delete,
          and filter event rankings
        </p>

      </div>

      <AddRankingForm
        refresh={fetchRankings}
      />

      <div
        className="
          bg-slate-800
          p-6
          rounded-2xl
        "
      >

        <h2
          className="
            text-2xl
            mb-4
            text-yellow-400
          "
        >
          Filter Rankings
        </h2>

        <select

          value={selectedEvent}

          onChange={(e) =>
            setSelectedEvent(
              e.target.value
            )
          }

          className="
            bg-slate-700
            p-3
            rounded-lg
            w-full
            md:w-80
          "
        >

          {uniqueEvents.map(
            (event, index) => (

              <option
                key={index}
                value={event}
              >
                {event}
              </option>

            )
          )}

        </select>

      </div>

      <div className="space-y-6">

        {filteredRankings.map(
          (item) => (

            <div
              key={item.id}

              className="
                space-y-4
              "
            >

              <RankingEditor

                item={item}

                refresh={
                  fetchRankings
                }

              />

              <button

                onClick={() =>
                  deleteRanking(
                    item.id
                  )
                }

                className="
                  bg-red-600
                  hover:bg-red-700

                  px-5
                  py-3

                  rounded-lg
                "
              >
                Delete Ranking
              </button>

            </div>

          )
        )}

      </div>

    </div>
  );
}