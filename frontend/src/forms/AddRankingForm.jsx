import { useState }
from "react";

import API from "../api/axios";

export default function AddRankingForm() {

  const [formData, setFormData] =
    useState({

      athlete_name: "",
      event_name: "",
      gold_medals: 0,
      silver_medals: 0,
      bronze_medals: 0,
      total_points: 0,
      ranking_position: 1,
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
          "/rankings",
          formData
        );

        alert(
          "Ranking added"
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
        bg-slate-800
        p-6
        rounded-2xl
        space-y-4
        max-w-xl
      "
    >

      <input
        name="athlete_name"
        placeholder="Athlete Name"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        name="event_name"
        placeholder="Event Name"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        type="number"
        name="gold_medals"
        placeholder="Gold Medals"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        type="number"
        name="silver_medals"
        placeholder="Silver Medals"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        type="number"
        name="bronze_medals"
        placeholder="Bronze Medals"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        type="number"
        name="total_points"
        placeholder="Total Points"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <input
        type="number"
        name="ranking_position"
        placeholder="Rank"
        onChange={handleChange}

        className="
          w-full
          p-3
          rounded-lg
          bg-slate-700
        "
      />

      <button
        className="
          bg-yellow-400
          text-black
          px-6
          py-3
          rounded-lg
          font-bold
        "
      >
        Add Ranking
      </button>

    </form>
  );
}