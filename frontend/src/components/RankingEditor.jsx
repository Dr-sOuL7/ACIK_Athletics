import { useState }
from "react";

import API from "../api/axios";

export default function RankingEditor({

  item,

  refresh,

}) {

  const [formData, setFormData] =
    useState({

      gold_medals:
        item.gold_medals,

      silver_medals:
        item.silver_medals,

      bronze_medals:
        item.bronze_medals,

      total_points:
        item.total_points,

      ranking_position:
        item.ranking_position,
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

          `/rankings/${item.id}`,

          formData
        );

        alert(
          "Ranking updated"
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
        "
      >
        {item.athlete_name}
      </h2>

      <p>
        {item.event_name}
      </p>

      <div
        className="
          grid
          grid-cols-2
          gap-4
        "
      >

        <input
          type="number"
          name="gold_medals"
          value={formData.gold_medals}
          onChange={handleChange}

          placeholder="Gold"

          className="
            p-3
            bg-slate-700
            rounded-lg
          "
        />

        <input
          type="number"
          name="silver_medals"
          value={formData.silver_medals}
          onChange={handleChange}

          placeholder="Silver"

          className="
            p-3
            bg-slate-700
            rounded-lg
          "
        />

        <input
          type="number"
          name="bronze_medals"
          value={formData.bronze_medals}
          onChange={handleChange}

          placeholder="Bronze"

          className="
            p-3
            bg-slate-700
            rounded-lg
          "
        />

        <input
          type="number"
          name="total_points"
          value={formData.total_points}
          onChange={handleChange}

          placeholder="Points"

          className="
            p-3
            bg-slate-700
            rounded-lg
          "
        />

        <input
          type="number"
          name="ranking_position"
          value={formData.ranking_position}
          onChange={handleChange}

          placeholder="Rank"

          className="
            p-3
            bg-slate-700
            rounded-lg
            col-span-2
          "
        />

      </div>

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
        Update Ranking
      </button>

    </form>
  );
}