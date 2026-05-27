import { useEffect, useState } from "react";

import API from "../api/axios";

import ResultCard from "../components/ResultCard";

export default function BestAthletes() {

  const [athletes, setAthletes] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchAthletes() {

      try {

        const res = await API.get("/results");
        setAthletes(res.data.filter(r => r.is_best === true));

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    fetchAthletes();

  }, []);

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          justify-center
          items-center
          text-2xl
        "
      >
        Loading best athletes...
      </div>

    );
  }

  return (

    <div className="p-6 md:p-10">

      <div className="mb-10 text-center">

        <h1
          className="
            text-5xl
            font-bold
            text-yellow-400
            mb-4
          "
        >
          Best Athletes
        </h1>

        <p
          className="
            text-slate-300
            text-lg
          "
        >
          Top performers of the Athletics Club
        </p>

      </div>

      {athletes.length === 0 ? (

        <div
          className="
            text-center
            text-slate-400
            text-xl
          "
        >
          No best athletes available.
        </div>

      ) : (

        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-8
          "
        >

          {athletes.map((item) => (

            <ResultCard

              key={item.id}

              item={item}

            />

          ))}

        </div>

      )}

    </div>
  );
}