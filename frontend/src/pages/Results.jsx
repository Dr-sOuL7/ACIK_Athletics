import { useEffect, useState } from "react";

import API from "../api/axios";

import ResultCard from "../components/ResultCard";

export default function Results() {

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchResults() {

      try {

        const res =
          await API.get("/results");

        setResults(res.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    fetchResults();

  }, []);

  const deleteResult = async (id) => {

    try {

      await API.delete(
        `/results/${id}`
      );

      setResults(

        results.filter(

          (item) => item.id !== id

        )
      );

    } catch (err) {

      console.log(err);

      alert("Delete failed");
    }
  };

  if (loading) {

    return (

      <div className="p-6">

        <h1 className="text-2xl">
          Loading results...
        </h1>

      </div>
    );
  }

  return (

    <div className="p-6">

      <h1
        className="
          text-4xl
          font-bold
          text-yellow-400
          mb-8
        "
      >
        Competition Results
      </h1>

      <div
        className="
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >

        {results.map((item) => (

          <ResultCard

            key={item.id}

            item={item}

            showDelete={true}

            onDelete={deleteResult}

          />

        ))}

      </div>

    </div>
  );
}